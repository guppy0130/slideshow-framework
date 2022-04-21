import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { exec, ExecException } from "child_process";
import { lstatSync, readFileSync } from "fs";
import { exit, env } from "process";
import { basename, join } from "path";

const argv = yargs(hideBin(process.argv))
  .options({
    presentation: {
      type: "string",
      demandOption: true,
      alias: "p",
      describe: "presentation to compile",
    },
    theme: {
      type: "string",
      demandOption: true,
      alias: "t",
      describe: "theme to use",
    },
  })
  .usage("Usage: [ts-node] ./$0 -p <presentation> -t <theme>")
  .check((argv) => {
    return (
      lstatSync(argv.theme).isDirectory() &&
      lstatSync(argv.presentation).isFile()
    );
  })
  .alias("h", "help")
  .alias("V", "version")
  .parseSync();

const { presentation, theme } = argv;

// https://stackoverflow.com/a/42037274
const encode_json_shell_escape = (content: string) => {
  return JSON.stringify({ content })
    .replace(/^"|"$/g, "") //remove JSON-string double quotes
    .replace(/'/g, "'\"'\"'"); //escape single quotes the ugly bash way
};

const exec_handler = (
  err: ExecException | null,
  stdout: string,
  stderr: string
) => {
  if (err) {
    console.error(stderr);
    exit(1);
  }
  console.log(stdout);
};

const presentation_content: string = readFileSync(presentation, {
  encoding: "utf-8",
});
const presentation_name: string = basename(presentation, ".md");
const output_dir: string = join(__dirname, "dest", presentation_name);

// build the theme by running make
const theme_build_command: string = "make";
console.log(`Compile ${theme} with command ${theme_build_command}`);
exec(
  theme_build_command,
  {
    cwd: theme,
    env: {
      ...env,
      MARKDOWN_CONTENT: encode_json_shell_escape(presentation_content),
      OUTPUT_LOCATION: output_dir,
    },
  },
  exec_handler
);

// send our content to the same destination
console.log("compiling scss");
exec(`sass --no-source-map src:${output_dir}`, exec_handler);
console.log("compiling ts");
exec(
  `tsc --outDir ${output_dir}`,
  { cwd: join(__dirname, "src") },
  exec_handler
);

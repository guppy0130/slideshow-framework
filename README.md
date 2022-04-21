# slideshow-framework

## Getting started

* Put together your template
  * should have an element with id `#content` whose `innerText` property
    contains the markdown to parse
  * example is [template.html](template.html)
  * include markdown-it and, optionally, highlight.js
* Build the content in `src` and include in project
* Call `create_slideshow()` to start the presentation

## Usage

### Keybindings

The following keybindings come pre-configured:

```javascript
let keys = {
  ArrowRight: nextSlide,
  ArrowDown: nextSlide,
  KeyJ: nextSlide,
  KeyL: nextSlide,
  Space: nextSlide,
  ArrowLeft: prevSlide,
  ArrowUp: prevSlide,
  KeyH: prevSlide,
  KeyK: prevSlide,
};
```

You can also use number keys to go directly to a slide:

```javascript
document.addEventListener("keydown", (e) => {
  // use the number keys to get to a slide directly.
  // the first slide should map to key 1 (not zero-indexed).
  if (parseInt(e.key)) {
    slideIndex = parseInt(e.key) - 1;
    showSlide(slideIndex);
  }
});
```

### Presenter Mode

Use `p` to access presenter's mode. In presenter's mode, a panel on the right
displays the presentation runtime and presenter notes for the current slide.

In the markdown, presenter notes for a slide come after the slide and are
delineated with `???` surrounded by newlines. After slides are parsed, the first
sequence of `\n???\n` will be considered the presenter notes marker, and all
content between that marker and the next slide will be rendered as presenter
notes. The presenter notes section supports markdown.

### CSS

`src/*.scss` should be compiled to `dest/presentation/*.css`. Include
`index.scss` at the minimum; this provides the logic for rendering/hiding slide
elements. It also provides logic for printing slides.

Your template can include its own theme; to get started, you can modify CSS for
the following classes:

* `.slide`
* `.presenterNotes`
* `.timer-container`

The `hidden` HTML property will be on slides and presenter notes that are not
active.

### Printing

The CSS in `src/index.scss` is configured so that each slide will print on its
own page. This makes it easy for folks to print N-many on the same page via
their printing options.

The extras panel on the right in presenter's mode will not be visible during
printing. You cannot print the presenter's notes at this time.

## Framework

### Pre-requisites

#### Required

* sass

#### Suggested

* typescript
* ts-node
* nodemon
* serve

### Usage

```console
$ ts-node index.ts -p presentations/test_presentation/test.md -t themes/example_theme
Compile .\themes\example_theme with command make
compiling scss
compiling ts

sass --no-source-map .:C:\Users\Nick\Documents\Git\slideshow-framework\dest\test
pug3 template.pug --out C:\Users\Nick\Documents\Git\slideshow-framework\dest\test --obj '{"content":"# hello world\n\nthis is first slide content\n\n---\n\n# second slide\n\nmore content here\n\n---\n\n```js\nconsole.log(\"some code!\");\n```\n"}' --pretty

  rendered C:\Users\Nick\Documents\Git\slideshow-framework\dest\test\template.html
```

You can then `serve` in the output directory, or use your webserver of choice.

### Theme

Provide your own theme with the following properties:

* a Makefile (or some other build tool) that accepts the following environment
  variables:
  * `OUTPUT_LOCATION` - something like `dest/<presentation name>`
  * `MARKDOWN_CONTENT` - a JSON-stringified dictionary, shell-escaped; the key
    is `content`, and the value is the markdown.
* You can choose the build tool, just update `index.ts` accordingly.
* The template's `script` and `link`'s sources should refer to files next to the
  rendered template.
* The template directory can be placed in `themes/` (but is not strictly
  necessary)

### Presentation

* Put presentations in `presentations` (not strictly necessary either)

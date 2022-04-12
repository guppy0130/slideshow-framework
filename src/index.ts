// wrap this all up inside a function so we can call it when we want to from
// the parent
const create_slideshow = (options: {
  slide_separator: string;
  markdown_renderer: markdownit;
  keys: {};
}) => {
  // fetch content
  const slide_separator = options["slide_separator"] || "\n---\n";

  let content_elem = document.getElementById("content");
  content_elem.style.display = "none";
  let content_arr = content_elem.innerText.split(slide_separator);

  // initialize markdown renderer
  let default_markdownit_options = {
    highlight: (str: string, lang: string) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlightAuto(str, [lang]).value;
      } else {
        return "";
      }
    },
    typographer: true,
  };
  let md: markdownit;
  if (
    options.markdown_renderer &&
    options.markdown_renderer instanceof window.markdownit
  ) {
    md = options.markdown_renderer;
  } else {
    md = window.markdownit(default_markdownit_options);
  }

  // initialize slideshow container
  let slideshow_container = document.createElement("div");
  slideshow_container.classList.add("slideshow-container");

  // add slides to the container
  let slides: HTMLDivElement[] = [];
  for (const c of content_arr) {
    let result = md.render(c.trim());
    let slide = document.createElement("div");
    slide.classList.add("slide");
    slide.innerHTML = result;
    slide.style.display = "none";
    slideshow_container.appendChild(slide);
    slides.push(slide);
  }

  // add slideshow container to the document
  content_elem.parentNode.appendChild(slideshow_container);

  // let us move between slides
  let slideIndex = 0;
  let showSlide = (index: number) => {
    // bound the input so you don't index out of bounds
    if (index >= slides.length) {
      index = slides.length - 1;
    }
    if (index < 0) {
      index = 0;
    }
    // hide all the slides
    for (let slide of slides) {
      slide.classList.remove("current");
      slide.style.display = "none";
    }
    // and then show the current slide
    slides[index].classList.add("current");
    slides[index].style.display = "block";
    slideIndex = index;
  };

  // convenience functions
  let nextSlide = () => showSlide(++slideIndex);
  let prevSlide = () => showSlide(--slideIndex);

  // show first slide
  showSlide(slideIndex);

  // configure keys
  let keys = options.keys || {
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

  document.addEventListener("keydown", (e) => {
    // e.preventDefault();
    // general navigation based on the dictionary
    if (e.code in keys) {
      keys[e.code]();
    }
    // use the number keys to get to a slide directly.
    // the first slide should map to key 1 (not zero-indexed).
    if (parseInt(e.key)) {
      slideIndex = parseInt(e.key) - 1;
      showSlide(slideIndex);
    }
  });
};

# slideshow-framework

## Getting started

* Put together your template
  * should have an element with id `#content` whose `innerText` property
    contains the markdown to parse
  * example is [template.html](template.html)
  * include markdown-it and, optionally, highlight.js
* Build the TS and include in project
* Include this in a `<script>` tag to start the presentation

  ```javascript
  var slideshow = create_slideshow({
    // what should separate slides? default is `\n---\n`
    slide_separator: "\n---\n",
    // you can pass in a custom markdown-it renderer here, and we'll just call
    // md.render() with your passed-in instance. This allows you to configure
    // your markdown-it plugins, your hljs configuration, etc.
    markdown_renderer: false,
    // keybindings to navigate between slides
    keys: {}
  });
  ```

## Usage

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

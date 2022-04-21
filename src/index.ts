// wrap this all up inside a function so we can call it when we want to from
// the parent
const createSlideshow = (options?: {
  slideSeparator?: string;
  markdownRenderer?: markdownit;
}) => {
  // slideshow properties
  let slideIndex = 0;
  let extrasVisible = false;

  // fetch content
  const slideSeparator = options?.slideSeparator ?? "\n---\n";
  const presenterNotesSeparator = "\n???\n";

  // hide the original markdown content
  let rawContentElement = document.getElementById("content");
  if (rawContentElement === null) {
    console.log("Missing content element? Is your template correct?");
    return;
  }

  // split the content into an array of markdown chunks. each chunk is a slide.
  let rawContentArray = rawContentElement.innerText.split(slideSeparator);

  // extract presenter notes from slides
  // the assumption is that presenter notes will follow the slide
  type slideshowDataType = {
    slide: string;
    presenterNotes: string;
  };
  let slideshowData: slideshowDataType[] = [];
  for (const content of rawContentArray) {
    let [trueContent, presenterNotes] = content.split(
      presenterNotesSeparator,
      2
    );
    slideshowData.push({
      slide: trueContent.trim(),
      presenterNotes: presenterNotes?.trim(),
    });
  }

  // initialize markdown renderer
  let defaultMarkdownitOptions = {
    highlight: (str: string, lang: string) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlightAuto(str, [lang]).value;
      } else {
        return "";
      }
    },
    typographer: true,
    // considered semi-safe, because you're providing all the content.
    // allows directly adding class names, etc. to slides/content for themes.
    html: true,
  };
  let md: markdownit;
  if (
    options?.markdownRenderer &&
    options?.markdownRenderer instanceof window.markdownit
  ) {
    md = options.markdownRenderer;
  } else {
    md = window.markdownit(defaultMarkdownitOptions);
  }

  // initialize slideshow container
  let slideshowContainer = document.createElement("div");
  slideshowContainer.classList.add("slideshow-container");

  // initialize extras container (timer, presenter notes)
  let extrasContainer = document.createElement("div");
  extrasContainer.classList.add("extras-container");

  // initialize timer
  let timerInterval: ReturnType<typeof setTimeout> | null = null;
  let slideshowTimer = 0;
  function renderTimer() {
    const h = Math.floor(slideshowTimer / 3600);
    const m = Math.floor((slideshowTimer % 3600) / 60);
    const s = slideshowTimer % 60;
    let timerString = [
      h,
      m > 9 ? m : h ? "0" + m : m || "00",
      s > 9 ? s : "0" + s || "00",
    ]
      .filter(Boolean)
      .join(":");
    timerPElement.innerText = timerString;
  }
  let tryStartTimer = () => {
    if (extrasVisible && !timerInterval) {
      timerInterval = setInterval(() => {
        ++slideshowTimer;
        renderTimer();
      }, 1000);
    }
  };
  let stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      pauseStartTimerButton.innerText = "Start";
    }
  };
  let startTimer = () => {
    if (!timerInterval) {
      tryStartTimer();
      pauseStartTimerButton.innerText = "Pause";
    }
  };
  let resetTimer = () => {
    stopTimer();
    slideshowTimer = 0;
    renderTimer();
  };

  // timer elements (text, buttons)
  let timerContainer = document.createElement("section");
  timerContainer.classList.add("timer-container");

  // for timer text
  let timerTitle = document.createElement("h2");
  timerTitle.innerText = "Timer";
  timerContainer.appendChild(timerTitle);
  let timerPElement = document.createElement("p");
  timerContainer.appendChild(timerPElement);

  // controls
  let timerButtonContainer = document.createElement("div");
  timerButtonContainer.id = "timer-button-container";
  timerContainer.appendChild(timerButtonContainer);

  // reset to zero + stop
  let resetTimerButton = document.createElement("button");
  resetTimerButton.id = "reset-timer-button";
  resetTimerButton.innerText = "Reset";
  resetTimerButton.addEventListener("click", resetTimer);
  timerButtonContainer.appendChild(resetTimerButton);

  // pause/start
  let pauseStartTimerButton = document.createElement("button");
  pauseStartTimerButton.id = "pause-restart-timer-button";
  // initialize the button
  pauseStartTimerButton.addEventListener("click", () => {
    timerInterval ? stopTimer() : startTimer();
  });
  pauseStartTimerButton.innerText = timerInterval ? "Pause" : "Start";
  timerButtonContainer.appendChild(pauseStartTimerButton);

  renderTimer();
  extrasContainer.append(timerContainer);

  // initialize presenter notes container
  let presenterNotesContainer = document.createElement("section");
  presenterNotesContainer.classList.add("presenter-container");
  let presenterNotesTitle = document.createElement("h2");
  presenterNotesTitle.innerText = "Presenter Notes";
  presenterNotesContainer.appendChild(presenterNotesTitle);
  extrasContainer.appendChild(presenterNotesContainer);

  // add content container to the document
  let contentContainer = document.createElement("main");
  contentContainer.id = "content-container";
  // place it at the end of the document
  if (rawContentElement.parentNode === null) {
    console.error("The raw content element should have body as its parent");
    return;
  }
  rawContentElement.parentNode.appendChild(contentContainer);
  contentContainer.appendChild(slideshowContainer);
  contentContainer.appendChild(extrasContainer);

  // add slides and presentation notes to their containers
  type renderedSlideElementType = {
    slide: HTMLElement;
    presenterNotes: HTMLElement;
  };
  let renderedSlideElements: renderedSlideElementType[] = [];
  for (const slideshowDataEntry of slideshowData) {
    let slideElement: renderedSlideElementType = {
      slide: document.createElement("article"),
      presenterNotes: document.createElement("aside"),
    };
    let key: keyof slideshowDataType;
    for (key in slideshowDataEntry) {
      let renderedContent = "";
      if (slideshowDataEntry[key]) {
        renderedContent = md.render(slideshowDataEntry[key]);
      }
      let slide = slideElement[key];
      slide.innerHTML = renderedContent;
      slide.classList.add(key);
      slide.hidden = true;
    }
    renderedSlideElements.push(slideElement);
    slideshowContainer.appendChild(slideElement.slide);
    presenterNotesContainer.appendChild(slideElement.presenterNotes);
  }

  let renderSlideAndPresenterNotes = (index: number) => {
    // bound the input so you don't index out of bounds
    if (index >= renderedSlideElements.length) {
      index = renderedSlideElements.length - 1;
    }
    if (index < 0) {
      index = 0;
    }
    // hide all the slides + presenter notes
    for (let slide of renderedSlideElements) {
      let key: keyof renderedSlideElementType;
      for (key in slide) {
        slide[key].hidden = true;
      }
    }
    // and then show the current slide
    let key: keyof renderedSlideElementType;
    for (key in renderedSlideElements[index]) {
      if (!extrasVisible && key === "presenterNotes") {
        continue;
      }
      renderedSlideElements[index][key].hidden = false;
    }
    return index;
  };

  let renderUI = (index: number) => {
    // update the slideIndex to the index of the slide rendered
    slideIndex = renderSlideAndPresenterNotes(index);
    // display extras if necessary
    extrasContainer.hidden = !extrasVisible;
  };

  // convenience functions
  let nextSlide = () => renderUI(++slideIndex);
  let prevSlide = () => renderUI(--slideIndex);

  // show first slide
  renderUI(slideIndex);

  // configure keys
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
    KeyP: () => {
      extrasVisible = !extrasVisible;
      renderUI(slideIndex);
    },
  };

  document.addEventListener(
    "keydown",
    (e) => {
      // do nothing on ctrl down, so that you preserve ctrl+p functionality.
      // ctrl+p should not trigger toggling extras panel
      if (e.ctrlKey) {
        return;
      }
      // general navigation based on the dictionary
      if (e.code in keys) {
        keys[e.code as keyof typeof keys]();
      }
      // use the number keys to get to a slide directly.
      // the first slide should map to key 1 (not zero-indexed).
      if (parseInt(e.key)) {
        slideIndex = parseInt(e.key) - 1;
        renderUI(slideIndex);
      }
    },
    true
  );

  // this isn't strictly necessary (the css will handle all of this
  // functionality), but it's correct semantically (removes `hidden`).
  // this won't let you print the presenter notes, but that's just a function of
  // the presenter notes being in a separate container element.
  // TODO: maybe figure out how to restructure this to allow printing presenter
  // notes? very low priority.
  if (window.matchMedia) {
    let cachedExtrasVisible: boolean = extrasVisible;
    let printRender = () => {
      for (const slide of renderedSlideElements) {
        slide.slide.hidden = false;
      }
      cachedExtrasVisible = extrasVisible;
      extrasVisible = false;
      extrasContainer.hidden = true;
    };
    // if we toggle between print and not print
    window.matchMedia("print").addEventListener("change", (e) => {
      if (e.matches) {
        // we're printing
        printRender();
      } else {
        // not printing. reset.
        extrasVisible = cachedExtrasVisible;
        renderUI(slideIndex);
      }
    });
    if (window.matchMedia("print").matches) {
      printRender();
    }
  }
};

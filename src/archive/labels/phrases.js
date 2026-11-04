// every phrase after the first must be opened by at least one word in an earlier phrase.
//   from: words in earlier phrases that open this one  -> { phrase: id, word: "word", lands: "word" }
//   to:   words in this phrase that open an older one   -> { word: "word", phrase: id, lands: "word" }
//         or a website, in a new tab                    -> { word: "word", url: "https://..." }
// lands: the word in the opened phrase that shows first on arrival, before the rest pops in (defaults to the same word).
// reveal: "order" makes the rest of the phrase appear word by word in reading order, instead of spreading out from the landed word.
// n / landsN are optional: which occurrence of word / lands, when it appears more than once (default 1).
// ask: { to: id } shows a text box under the phrase; what the reader types opens phrase id,
//      where {answer} in its text is replaced by what they typed (and can be used as a word like any other).
// all: id makes every word of the phrase open phrase id, and the screen just changes (nothing carries over).
// next: id (on a phrase with text "") makes a blank screen; a click anywhere opens phrase id.
// write paragraphs with backticks (`...`) and leave a blank line between them.

const PHRASES = [
  {
    id: 1,
    text: "labels",
  },
  {
    id: 2,
    text: "what do we think of labels?",
    from: [{ phrase: 1, word: "labels", lands: "labels" }],
  },
  {
    id: 3,
    text: "something that is of certain character, or something that lacks it entirely?",
    from: [{ phrase: 2, word: "of", lands: "of" }],
  },
  {
    id: 4,
    text: "a label is something that cannot be defined, owning self definition.",
    from: [
      { phrase: 3, word: "something", lands: "something" },
      { phrase: 3, word: "something", n: 2, lands: "something" },
    ],
  },
  {
    id: 5,
    text: "what does self mean?",
    from: [{ phrase: 4, word: "self", lands: "self" }],
  },
  {
    id: 6,
    text: "an attempt on being slightly creative, and being able to express myself. enjoying meaningless reminiscence.",
    from: [{ phrase: 5, word: "mean", lands: "meaningless" }],
  },
  {
    id: 7,
    text: "i enjoy spending my time thinking about what i should be spending my time on, therapeutic.",
    from: [{ phrase: 6, word: "myself", lands: "my" }],
  },
  {
    id: 8,
    text: "sense?",
  },
  {
    id: 12,
    text: "nonsense.",
    from: [{ phrase: 8, word: "sense", lands: "nonsense" }],
  },
  {
    id: 13,
    text: "none of it does. it's not supposed to.",
    from: [{ phrase: 12, word: "nonsense", lands: "none" }],
  },
  {
    id: 15,
    text: `labels don't replace the "why?" don't try.`,
    from: [{ phrase: 13, word: "does", lands: "don't" }],
    to: [{ word: "labels", phrase: 1, lands: "labels" }],
  },
  {
    id: 16,
    text: "this is based on personal experience, so try this at home.",
    from: [{ phrase: 15, word: "try", lands: "try" }],
  },
  {
    id: 17,
    text: "can you describe home?",
    from: [{ phrase: 16, word: "home", lands: "home" }],
    ask: { to: 14 },
  },
  {
    id: 14,
    text: "do you know why you chose {answer}?",
    to: [{ word: "{answer}", phrase: 18, lands: "{answer}" }],
  },
  {
    id: 18,
    text: `for me, it's "belonging", for you it's {answer}. for the next it could be something similar, but always different. labels introduce a place that feels familiar but is no different, questions create reason, a sensation rather than just definition.`,
  },
  {
    id: 19,
    text: "curiosity creates action.",
    from: [{ phrase: 18, word: "create", lands: "creates" }],
    all: 20,
  },
  {
    id: 20,
    text: "",
    next: 21,
  },
  {
    id: 21,
    text: "the obvious is boring, the unknown is challenging, conforming is easy.",
  },
  {
    id: 22,
    text: "easy enough to say and do, but not question.",
    from: [{ phrase: 21, word: "easy", lands: "easy" }],
  },
  {
    id: 9,
    text: "never gonna give you up",
    reveal: "order",
    from: [{ phrase: 17, word: "you", lands: "you" }],
    to: [{ word: "you", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }],
  },
  {
    id: 10,
    text: "reminiscence is the act of remembering, talking, or writing about past experiences, often in a casual, warm, or nostalgic way. i didn't know myself.",
    from: [{ phrase: 6, word: "reminiscence", lands: "reminiscence" }],
    to: [{ word: "myself", phrase: 6, lands: "myself" }],
  },
  {
    id: 11,
    text: "not really that therapeutic, it still doesn't make any sense.",
    from: [{ phrase: 7, word: "therapeutic", lands: "therapeutic" }],
    to: [{ word: "sense", phrase: 8, lands: "sense" }],
  },
];

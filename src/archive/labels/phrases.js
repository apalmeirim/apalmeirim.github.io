// every phrase after the first must be opened by at least one word in an earlier phrase.
//   from: words in earlier phrases that open this one  -> { phrase: id, word: "word", lands: "word" }
//   to:   words in this phrase that open an older one   -> { word: "word", phrase: id, lands: "word" }
//         or a website, in a new tab                    -> { word: "word", url: "https://..." }
// lands: the word in the opened phrase that shows first on arrival, before the rest pops in (defaults to the same word).
// reveal: "order" makes the rest of the phrase appear word by word in reading order, instead of spreading out from the landed word.
// n / landsN are optional: which occurrence of word / lands, when it appears more than once (default 1).

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
    text: "a place to spend my time making it all make sense. everything perfectly labeled. think outside the box. welcome back? maybe? see you later, alligator.",
    from: [
      { phrase: 7, word: "time", lands: "time" },
      { phrase: 7, word: "time", n: 2, lands: "time" },
      { phrase: 2, word: "think", lands: "think" },
    ],
    to: [{ word: "labeled", phrase: 1, lands: "labels" }],
  },
  {
    id: 9,
    text: "never gonna give you up",
    reveal: "order",
    from: [{ phrase: 8, word: "you", lands: "you" }],
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

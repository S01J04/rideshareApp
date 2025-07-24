// src/utils/calculateAverage.js

const ratingLabels = [
  "Excellent",
  "Good",
  "Okay",
  "Disappointing",
  "Very Disappointing",
];

const calculateAverageAndBreakdown = (reviews = []) => {
  const breakdown = ratingLabels.reduce((acc, label) => {
    acc[label] = 0;
    return acc;
  }, {});

  reviews.forEach((review) => {
    if (review.rating && breakdown.hasOwnProperty(review.rating)) {
      breakdown[review.rating] += 1;
    }
  });

  const average =
    reviews.length > 0
      ? (
          Object.entries(breakdown).reduce((acc, [label, count]) => {
            const score =
              label === "Excellent"
                ? 5
                : label === "Good"
                ? 4
                : label === "Okay"
                ? 3
                : label === "Disappointing"
                ? 2
                : 1;
            return acc + count * score;
          }, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return { average, breakdown ,ratingLabels};
};

export default calculateAverageAndBreakdown;

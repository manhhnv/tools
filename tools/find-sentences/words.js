const findWords = async (bookNId, unitNId, collection) => {
  const words = await collection
    .find({
      bookNId: {
        $eq: bookNId,
      },
      unitNId: {
        $eq: unitNId,
      },
    })
    .project({
      content: 1, meaning: 1, _id: 1, bookNId: 1, unitNId: 1,
    })
    .toArray();
  return words;
};

const allPrevWords = async (bookNId, unitNId, collection) => {
  const words = await collection
    .find({
      $or: [
        {
          bookNId: {
            $lte: bookNId,
          },
        },
        {
          bookNId: {
            $eq: bookNId,
          },
          unitNId: {
            $lt: unitNId,
          },
        },
      ],
    })
    .project({
      content: 1, meaning: 1, _id: 1, bookNId: 1, unitNId: 1,
    })
    .toArray();
  return words;
};

export { findWords, allPrevWords };

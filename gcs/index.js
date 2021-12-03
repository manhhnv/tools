/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// The ID of your GCS bucket
// const bucketName = 'your-unique-bucket-name';

// The directory prefix to search for
// const prefix = 'myDirectory/';

// The delimiter to use
// const delimiter = '/';

// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");

// Creates a client
const storage = new Storage({
  projectId: "hoclieu-cloud-storage",
  credentials: {
    client_email:
      "manhnv-hoclieu@hoclieu-cloud-storage.iam.gserviceaccount.com",
    client_id: "102141690157279706772",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCp7FVIOesUYjst\nEKTJoFqOt07hzQhhh7z0HmcTX0/I3Z6qGG1IJnCWqZxpkZylpm0eB2w/LMybnMES\ndE2B5MtQIcw5qqax5TDT8sOKXiyYUsco4v7z0GxEUagJv4/Th/0c3BjKTno+NKZS\npqh48Koj7fb/lyliYpmd45/93jC027MjOnR0+dY5v3AdtwKR7t9Oj++XruslMaHt\n9x+uTNqEmVNYhQXBOi0uv0yRGGcmq5T2yQ0Rn44JditTr5NuCbRQzmNiNwxiQ+cI\nJZwhg29GncRI/a8X6vep9Ps3CWlmv/GAJqPrkBd8RNGJ4Mk3UOC3RUZdGH0In5X4\nqevMTnYhAgMBAAECggEAHw0Y6IHs+2SX+7w24MF0yu+kco7NIUV0ugd0Po4EPmiB\nPgQItE6R9HY6JvB896hZ+ErS9Rhyq10RyxWFtF7i6FnEwCT3ITsImTKbmQVskMlP\nq6EPhe5oWnOxiVaAKd+H2WY/AXklzYhBfIkH8FHKRZaOtFYjMd9iwv99lR6tN99B\nnrQMo7rXk8R3KLugoNcb4bMvuEh2xPbYo8X2cdmxL7XwAv/NzVOpG51Cp++swSix\n0wfSSBQv5XIQmKfmeTR0krLsNbH0GkUzQvG/oKUvSwmbJlrx1kQoefwCQ790DPbm\nIlEFWbEuuBzlyW0AFaoOg2PI49QriEg2X9LMGtp/oQKBgQDcGBDjEXMRZKzyCCpk\nT92Q/LY6ALWGebayjzo6S/aGlVTtVimEZHV/so6LgFHl/N9eLM2o339ItDDBHLKp\nTLOl4of+q9sEYRZI6V+8txe8rPzQ2IKR+HoydxKL8QLzjjudoyGabdH/r02vRWnS\nQCYJf0thdEZqO5zrhpItosRA6wKBgQDFpPLx16cE0byVZrgGelXHjC8u7obWchJ/\n/MefRknzSOT7R56x0bT6dFvipKXpobq1FbQjYrmqiQt8HNAhABkNw8pDscgSAPq1\nt2Bo2wM2cWwl40S6mI65RJLTJdbA0vtIjQFz+Lqp/EHo2CgY8HPFqMryQaMPSRUp\n2KxD8PdCIwKBgAo9UGPQBwNzJJyqBpbeJFe/ehbeu5NDDF3oTfQyXojKX8Ye8RWI\nuvKy8vDIiobhqd6uxO6rXzeZsn75f9JikCUSkfMmOa1NewTvXpXgCsmrXqO0vvZd\nkgnRAlriXpnILzvZQBH4NAHqPPn/h7nRZDOi6XXiO/hrR5SpkRlwbiL7AoGBAISd\nhz3q23CKYqVEhRojn8cDMu2ksujVJcCnFjKy8Q/Cy5Innj3mXi7nQHg0zfaTxDmZ\nVIOhzL62sfQXSTe7XxQzWVZOxdX+vjqLzq7Mtb0kIdLSSd2CW9HIR1RSQWSkrGMj\n6eOs82L3linsUAtb2/K2rWYb0JODECZB8mSsHNxNAoGAJ+RSXF/qS+69JX6zdm+9\neDygdWCvntxArozmA8yPceca30hBU7BYX5EvnFoR2duBOG0QpHcJr/LV2duMnEaW\nNJYVG9oafdnDkkzx2KA9nhKWVuhnq/PMAvocTnVFwKa4VT9/fa0AoP7z2aZ6QYHF\nKPKlIeEmShHqkk9/rnklphY=\n-----END PRIVATE KEY-----\n",
    type: "service_account"
},
});

async function listFilesByPrefix() {
  bucketName = "hoclieu"
  // await storage.bucket(bucketName).makePublic({includeFiles: true});
  /**
   * This can be used to list all blobs in a "folder", e.g. "public/".
   *
   * The delimiter argument can be used to restrict the results to only the
   * "files" in the given "folder". Without the delimiter, the entire tree under
   * the prefix is returned. For example, given these blobs:
   *
   *   /a/1.txt
   *   /a/b/2.txt
   *
   * If you just specify prefix = 'a/', you'll get back:
   *
   *   /a/1.txt
   *   /a/b/2.txt
   *
   * However, if you specify prefix='a/' and delimiter='/', you'll get back:
   *
   *   /a/1.txt
   */
  delimiter = "";
  prefix = "/";
  const options = {
    prefix: prefix,
  };

  if (delimiter) {
    options.delimiter = delimiter;
  }

  // Lists files in the bucket, filtered by a prefix
  const [files] = await storage.bucket(bucketName).getFiles();

  console.log("Files:");
  files.forEach((file) => {
    if (file.metadata.metadata?.type) {
      console.log(file.metadata.metadata.type);
      console.log(file.publicUrl())
    }
  });
}

listFilesByPrefix().catch(console.error);

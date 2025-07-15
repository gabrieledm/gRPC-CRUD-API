# gRPC-CRUD-API

Simple `Node.js` application that expose a `gRPC` server with `CRUD` operations

## Getting started

- Start `MongoDB`
  ```bash
  docker compose up -d
  ```
- Install dependencies
  ```bash
  npm i
  ```
- Start the server
  ```bash
  npm start
  ```
  - The output should be the following
    ```
    > grpc-nodejs@1.0.0 start
    > node server.js
    
    mongodb-client >> connect >> Connection to mongodb://localhost:27017
    mongodb-client >> connect >> Connection to DB started: blog
    Server running at address 127.0.0.1:50051
    ```
- Import the [blogs.proto](protos/blogs.proto) into your preferred `API` client (Es. `Postman`)
- Perform the available calls
  - `ListBlogs`
    - Empty body
  - `CreateBlog`
    - Body
      ```json
      {
         "blog": {
           "author": "Gabriele",
           "title": "New Blog",
           "content": "Amazing content"
        }
      }
      ```
  - `ReadBlog`
    - Body
      ```json
      {
         "author": "Stephane"
      }
      ``` 
  - `UpdateBlog`
    - Body
      ```json
      {
          "blog": {
              "id": "68761a6d699c6455bed15758",
              "author": "James"
          }
      }
      ``` 
  - `DeleteBlog`
    - Body
      ```json
      {
        "id": "68761a6d699c6455bed15758"
      }
      ```
  - `ListBlogsStream`
    - Empty body
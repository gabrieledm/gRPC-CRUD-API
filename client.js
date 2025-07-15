/* eslint-disable */
// noinspection JSVoidFunctionReturnValueUsed

const path = require('path')
const protoLoader = require('@grpc/proto-loader')
const grpc = require('@grpc/grpc-js')

// gRPC service definition
const blogsProtoPath = path.join(__dirname, 'protos', 'blogs.proto')
const blogsProtoDefinition = protoLoader.loadSync(blogsProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const { blogs: blogsPackageDefinition } = grpc.loadPackageDefinition(
  blogsProtoDefinition,
)

const serverAddress = '127.0.0.1:50051'
const client = new blogsPackageDefinition.BlogsService(
  serverAddress,
  grpc.credentials.createInsecure(),
)

const callListBlogs = () =>
  new Promise((resolve, reject) => {
    client.listBlogs({}, (error, response) => {
      if (error) {
        console.error(
          `callListBlogs >> Error receiving response: ${error.message}`,
        )
        reject(error)
      }
      const { blogs } = response
      console.info('callListBlogs >> Received response')
      console.info(blogs)
      resolve(blogs)
    })
  })

const callListBlogsStream = () => {
  const call = client.listBlogsStream({}, () => {})
  call.on('data', (response) => {
    console.info('callListBlogsStream >> Received data')
    console.info(response.blog)
  })
  call.on('error', (error) => {
    console.log(`callListBlogsStream >> Error: ${error.message}`)
  })
  call.on('end', () => {
    console.log('callListBlogsStream >> Blogs data ended')
  })
}

const callReadBlog = () => {
  const readBlogRequest = {
    author: 'Stephane',
    title: 'Stephs Blog Title',
    content: 'First blog',
  }
  return new Promise((resolve, reject) => {
    client.readBlog(readBlogRequest, (error, response) => {
      if (error) {
        console.error(
          `callReadBlog >> Error receiving response: ${error.message}`,
        )
        reject(error)
      }
      const { blog } = response
      console.info('callReadBlog >> Received response')
      console.info(blog)
      resolve(blog)
    })
  })
}

const callCreateBlog = () => {
  const createBlogRequest = {
    blog: {
      author: 'Gabriele',
      title: 'A little blog',
      content: 'Little blog content',
    },
  }
  client.createBlog(createBlogRequest, (error, response) => {
    if (error) {
      console.error(
        `callCreateBlog >> Error receiving response: ${error.message}`,
      )
      return error
    }
    const { blog } = response
    console.info('callCreateBlog >> Received response')
    console.info(blog)
    return blog
  })
}

const callUpdateBlog = () => {
  callReadBlog().then(({ id }) => {
    const updateBlogRequest = {
      blog: {
        id,
        author: 'New Author',
        title: 'New title',
        content: 'New content',
      },
    }
    client.updateBlog(updateBlogRequest, (error, response) => {
      if (error) {
        console.error(
          `callUpdateBlog >> Error receiving response: ${error.message}`,
        )
        return error
      }
      const { blog } = response
      console.info('callUpdateBlog >> Received response')
      console.info(blog)
      return blog
    })
  })
}

const callDeleteBlog = () => {
  callListBlogs().then((blogs) => {
    const [blog] = blogs
    const deleteBlogRequest = {
      id: blog.id,
    }
    client.deleteBlog(deleteBlogRequest, (error, response) => {
      if (error) {
        console.error(
          `callDeleteBlog >> Error receiving response: ${error.message}`,
        )
        return error
      }
      const { blog } = response
      console.info('callDeleteBlog >> Received response')
      console.info(blog)
      return blog
    })
  })
}

const main = () => {
  callListBlogs()
  callListBlogsStream()
  callReadBlog()
  callCreateBlog()
  callUpdateBlog()
  callDeleteBlog()
}

main()

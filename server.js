const path = require('path')
const grpc = require('@grpc/grpc-js')
const { getProtoDefinition } = require('./utils/proto-utils')

const protoName = 'blogs'
const blogsPackageDefinition = getProtoDefinition(
  path.join(__dirname, 'protos'),
  protoName,
  protoName,
)

const {
  connect,
  disconnect,
} = require('./persistence/mongodb-client')
const {
  findAll,
  findAllStream,
  findRpc,
  save,
  saveRpc,
  updateRpc,
  deleteRpc,
} = require('./service/blog-service')

const fileName = path.basename(__filename).replace('.js', '')

const initialData = [
  {
    author: 'Stephane',
    title: 'Stephs Blog Title',
    content: 'First blog',
  },
  {
    author: 'Paulo',
    title: 'Paulos blog title',
    content: 'First blog',
  },
  {
    author: 'James',
    title: 'James blog title',
    content: 'First Blog',
  },
]

const main = async () => {
  await connect()
  initialData.forEach((data) =>
    save(data).catch((error) => console.error(error.message)),
  )

  const address = '127.0.0.1:50051'
  const server = new grpc.Server()
  server.addService(blogsPackageDefinition.BlogsService.service, {
    listBlogs: findAll,
    listBlogsStream: findAllStream,
    readBlog: findRpc,
    createBlog: saveRpc,
    updateBlog: updateRpc,
    deleteBlog: deleteRpc,
  })
  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    () => {
      // server.start()
      console.log(`Server running at address ${address}`)
    },
  )

  process.on('SIGINT', async () => {
    console.info(`${fileName} >> Received shutdown signal...`)
    await disconnect()
    console.info(`${fileName} >> ...Shutdown completed`)
    process.exit(0)
  })

  process.on('exit', () => {
    console.info(`${fileName} >> Exiting from server`)
  })
}

if (process.env.NODE_ENV !== 'test') {
  main().catch(console.error)
}

module.exports = {
  main,
}

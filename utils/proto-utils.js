const path = require('path')
const protoLoader = require('@grpc/proto-loader')
const grpc = require('@grpc/grpc-js')

const getProtoDefinition = (baseProtoPath, fileName, packageName) => {
  const currentFileName =
    fileName.indexOf('.proto') === -1 ? `${fileName}.proto` : fileName
  const currentProtoPath =
    baseProtoPath || path.join(__dirname, 'protos')
  const protoFileDefinition = path.join(
    currentProtoPath,
    currentFileName,
  )
  const protoDefinition = protoLoader.loadSync(protoFileDefinition, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  })
  const packageDefinition =
    grpc.loadPackageDefinition(protoDefinition)
  return packageDefinition[packageName]
}

module.exports = { getProtoDefinition }

/* eslint-disable */
const path = require('path')

const {
  findDocsByKeySync,
  findSingleDocByKeySync,
  insertOneDocIntoCollectionSync,
  updateOneDocIntoCollectionSync,
  removeOneDocFromCollectionSync,
} = require('../persistence/mongodb-client')
const { ObjectId } = require('mongodb')

const fileName = path.basename(__filename).replace('.js', '')
const collectionName = 'blogs'

const findAll = (call, callback) => {
  findDocsByKeySync(
    collectionName,
    {},
    {
      projection: {},
    },
  )
    .then((blogs) => {
      const toBeReturned = blogs.map((blog) => {
        const cleanedBlog = {
          ...blog,
          id: blog._id.toString(),
        }
        delete cleanedBlog._id
        return cleanedBlog
      })
      return callback(null, { blogs: toBeReturned })
    })
    .catch((error) => {
      console.error(
        `${fileName} >> findAll >> Error extracting data: ${error.message}`,
      )
      return callback(error)
    })
}

const findAllStream = (call) => {
  findDocsByKeySync(
    collectionName,
    {},
    {
      projection: {},
    },
  )
    .then((blogs) => {
      blogs.forEach((blog) => {
        const blogResponse = {
          blog: { ...blog, id: blog._id.toString() },
        }
        delete blogResponse.blog._id

        call.write(blogResponse)
      })
      call.end()
    })
    .catch((error) => {
      console.error(
        `${fileName} >> findAll >> Error extracting data: ${error.message}`,
      )
      throw error
    })
}

const find = async (filter = {}, fieldsToView = { _id: false }) => {
  try {
    const populatedFilter = {}
    Object.keys(filter).filter((key) => !!filter[key]).forEach(key => populatedFilter[key] = filter[key])
    return findSingleDocByKeySync(collectionName, populatedFilter, {
      projection: fieldsToView,
    })
  } catch (error) {
    console.error(
      `${fileName} >> find >> Error extracting data: ${error.message}`,
    )
    throw error
  }
}

const findRpc = (call, callback) => {
  const { request } = call
  find(request, {})
    .then((blog) => {
      let toBeReturned = {}
      if(blog?._id) {
        toBeReturned = {
          blog: {
            ...blog,
            id: blog?._id.toString(),
          },
        }
        delete toBeReturned.blog._id
      }
      return callback(null, toBeReturned)
    })
    .catch((error) => {
      console.error(
        `${fileName} >> findRpc >> Error extracting data: ${error.message}`,
      )
      return callback(error)
    })
}

const save = async ({ author, title, content }) => {
  if (!author || !title || !content) {
    return null
  }

  const existingBlog = await find({
    author,
    title,
    content,
  })
  if (existingBlog) {
    throw new Error(`Blog from "${author}" with "${title}" title already exists`)
  }
  try {
    return insertOneDocIntoCollectionSync(collectionName, {
      author,
      title,
      content,
    })
  } catch (error) {
    console.error(
      `${fileName} >> save >> Error saving data: ${error.message}`,
    )
  }
  return null
}

const update = async (id, toUpdate) => {
  if (!id) {
    return null
  }

  try {
    delete toUpdate.id
    return updateOneDocIntoCollectionSync(
      collectionName,
      {
        _id: new ObjectId(id),
      },
      toUpdate,
    )
  } catch (error) {
    console.error(
      `${fileName} >> update >> Error updating data: ${error.message}`,
    )
  }
  return null
}

const remove = async (id) => {
  if (!id) {
    return null
  }

  try {
    return removeOneDocFromCollectionSync(collectionName, {
      _id: new ObjectId(id),
    })
  } catch (error) {
    console.error(
      `${fileName} >> remove >> Error removing data: ${error.message}`,
    )
  }
  return null
}

const saveRpc = (call, callback) => {
  const {
    request: { blog },
  } = call

  save(blog)
    .then(({ insertedId }) => {
      find({ _id: insertedId }, {})
        .then((savedBlog) => {
          const blogResponse = {
            blog: {
              ...savedBlog,
              id: savedBlog._id.toString(),
            },
          }
          delete blogResponse.blog._id
          return callback(null, blogResponse)
        })
        .catch((error) => {
          console.error(
            `${fileName} >> saveRpc >> Error retrieving saved data: ${error.message}`,
          )
          return callback(error)
        })
    })
    .catch((error) => {
      console.error(
        `${fileName} >> saveRpc >> Error saving data: ${error.message}`,
      )
      return callback(error)
    })
}

const updateRpc = (call, callback) => {
  const {
    request: {
      blog: { id },
      blog,
    },
  } = call

  update(id, blog)
    .then(({ modifiedCount }) => {
      if (modifiedCount === 0) {
        return new Error('Not found')
      }
      find({ _id: new ObjectId(id) }, {})
        .then((updatedBlog) => {
          const updateBlogResponse = {
            blog: {
              ...updatedBlog,
              id: updatedBlog._id.toString(),
            },
          }
          delete updateBlogResponse.blog._id
          return callback(null, updateBlogResponse)
        })
        .catch((error) => {
          console.error(
            `${fileName} >> updateRpc >> Error retrieving updated data: ${error.message}`,
          )
          return callback(error)
        })
    })
    .catch((error) => {
      console.error(
        `${fileName} >> updateRpc >> Error updating data: ${error.message}`,
      )
      return callback(error)
    })
}

const deleteRpc = (call, callback) => {
  const {
    request: { id },
  } = call

  find({ _id: new ObjectId(id) }).then((blog) => {
    remove(id)
      .then(({ deletedCount }) => {
        if (deletedCount === 0) {
          return new Error('Not found')
        }
        const deleteBlogResponse = {
          blog: {
            ...blog,
            id,
          },
        }
        return callback(null, deleteBlogResponse)
      })
      .catch((error) => {
        console.error(
          `${fileName} >> deleteRpc >> Error updating data: ${error.message}`,
        )
        return callback(error)
      })
  })
}

module.exports = {
  findAll,
  findAllStream,
  find,
  findRpc,
  save,
  saveRpc,
  updateRpc,
  deleteRpc,
  // remove,
}

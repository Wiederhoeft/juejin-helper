// 沸点评论
const { getCookie } = require('../cookie')
const JuejinHttp = require('../api')
// const { getRandomSentence } = require('../../utils/jinrishici')
const { getHitokotoWords } = require('../../utils/hitokoto')
const { insertTo, dbGet } = require('../../utils/db')
const { saveComments } = require('../common')
const config = require('../../config')
const { getRandomInt } = require('./../../utils/index')

async function pinComment(task) {
  const cookie = await getCookie()
  const API = new JuejinHttp(cookie)
  const pins = await API.getRecommendPins()
  if (pins.length == 0) {
    console.log(`获取沸点列表失败[d1]`)
    return
  }
  const times = task.limit - task.done // 需要执行的次数
  console.log(`需要评论${times}篇沸点`)
  for (let i = 0; i < times; i++) {
    const article = pins[i] || pins[0]
    // 随机评论一句古诗
    const { msg_id, content } = article.msg_Info
    await saveComments(msg_id, 4)
    const newDbComments = await dbGet('/comments/pin')
    const word = await getHitokotoWords()
    const comments = [word].concat(newDbComments || [])
    const index = getRandomInt(0, comments.length - 1)
    const words = comments[index] || word
    const comment = await API.articleCommentAdd(msg_id, words, 4)
    // 删除评论
    if (!config.user.privacy) await API.articleCommentRemove(comment.comment_id)
  }
  console.log(`评论沸点 done`)
}

module.exports = pinComment

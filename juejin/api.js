const axios = require('axios')
const _ = require('lodash')
const { deepMerge, getRandomInt } = require('../utils')

const defaultOptions = {
  method: 'GET',
  data: {},
  params: {},
  headers: {
    origin: 'https://juejin.cn',
    pragma: 'no-cache',
    referer: 'https://juejin.cn/',
    'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
  },
}

class JuejinHttp {
  constructor(cookie) {
    this.cookie = cookie || ''
  }

  request(options) {
    return new Promise((resolve, reject) => {
      options = Object.assign({}, options, {
        headers: {
          cookie: this.cookie || '',
        },
      })
      const opts = deepMerge(defaultOptions, options)
      axios(opts)
        .then((res) => {
          const data = res.data || {}
          resolve(data.data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  queryUserProfile() {
    return this.request({
      method: 'GET',
      url: 'https://api.juejin.cn/user_api/v1/user/get',
    })
  }

  // 获取今日状态
  queryTodayStatus() {
    return this.request({
      method: 'GET',
      url: 'https://api.juejin.cn/growth_api/v1/get_today_status',
    })
  }

  // 今日签到
  handleCheckIn() {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/growth_api/v1/check_in',
    })
  }

  // 开始抽奖
  handleLotteryDraw() {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/growth_api/v1/lottery/draw',
    })
  }

  queryUserToken() {
    return this.request({
      method: 'GET',
      url: 'https://juejin.cn/get/token',
    })
  }

  // 查询总矿石
  queryTotalPoint() {
    return this.request({
      method: 'GET',
      url: 'https://api.juejin.cn/growth_api/v1/get_cur_point',
    })
  }

  // 查询是否有免费抽奖次数
  queryLotteryConfig() {
    return this.request({
      method: 'GET',
      url: 'https://api.juejin.cn/growth_api/v1/lottery_config/get',
    })
  }

  // 获取沾喜气列表
  queryLuckyList() {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/growth_api/v1/lottery_history/global_big',
      data: { page_no: 1, page_size: 5 },
    })
  }

  // 沾喜气  id
  handleDipLucky(id) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/growth_api/v1/lottery_lucky/dip_lucky',
      data: { lottery_history_id: id },
    })
  }

  getTaskList(growth_type = 1) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/growth_api/v1/user_growth/task_list',
      data: { growth_type },
    })
  }

  // 获取推荐文章列表
  getRecommendArticles(sort_type = 300) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed',
      data: {
        client_type: 2608,
        cursor: '0',
        id_type: 2,
        limit: 20,
        sort_type, // 300 最新排序
      },
    })
  }

  // 点赞
  diggSave(articleId, item_type = 2) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/interact_api/v1/digg/save',
      data: {
        client_type: 2608,
        item_id: `${articleId}`,
        item_type,
      },
    })
  }

  diggCancel(articleId, item_type = 2) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/interact_api/v1/digg/cancel',
      data: {
        client_type: 2608,
        item_id: `${articleId}`,
        item_type,
      },
    })
  }

  // 获取我的收藏集
  getMyCollectionset(article_id = '') {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/interact_api/v2/collectionset/list',
      data: {
        article_id: `${article_id}`,
        cursor: '0',
        limit: 10,
      },
    })
  }

  // 文章收藏
  articleCollectAdd(article_id, collection_id) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/interact_api/v2/collectionset/add_article',
      data: {
        article_id: `${article_id}`,
        is_collect_fast: false,
        select_collection_ids: [`${collection_id}`],
        unselect_collection_ids: [],
      },
    })
  }

  articleCollectRemove(article_id) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/interact_api/v2/collectionset/delete_article',
      data: {
        article_id: `${article_id}`,
      },
    })
  }

  // 获取推荐用户
  getRecommendAuthors() {
    // const categoryIds = [6809637769959178254, 6809637767543259144, 6809635626879549454, 6809635626661445640, 6809637773935378440, 6809637771511070734, 6809637776263217160, 6809637772874219534]
    const page = getRandomInt(0, 4)
    const cursor = page * 20
    // 随机分页 和 随机 分类
    return this.request({
      method: 'GET',
      url: `https://api.juejin.cn/user_api/v1/author/recommend`,
      params: {
        cursor,
        limit: 20,
      },
    })
  }

  // 关注/取消关注用户
  toggleFollowAuthor(uid, isFollow = true) {
    return this.request({
      method: 'POST',
      url: `https://api.juejin.cn/interact_api/v1/follow/${isFollow ? 'do' : 'undo'}`,
      data: {
        type: 1,
        id: uid,
      },
    })
  }

  // 文章评论
  // item_type 2 为 文章 4 为 沸点
  articleCommentAdd(article_id, content, item_type = 2) {
    return this.request({
      method: 'POST',
      url: `https://api.juejin.cn/interact_api/v1/comment/publish`,
      data: {
        client_type: 2608,
        comment_content: `${content}`,
        comment_pics: [],
        item_id: article_id,
        item_type,
      },
    })
  }

  // 删除文章评论
  articleCommentRemove(comment_id) {
    return this.request({
      method: 'POST',
      url: `https://api.juejin.cn/interact_api/v1/comment/delete`,
      data: {
        comment_id,
      },
    })
  }

  // 获取沸点列表
  getRecommendPins(sort_type = 300) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/recommend_api/v1/short_msg/recommend',
      data: {
        cursor: '0',
        id_type: 4,
        limit: 20,
        sort_type,
      },
    })
  }

  // 发布沸点
  pinPublish(content) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/content_api/v1/short_msg/publish',
      data: {
        content,
        sync_to_org: false,
        topic_id: '6824710202562969614',
      },
    })
  }

  // 删除沸点
  pinRemove(msg_id) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/content_api/v1/short_msg/delete',
      data: {
        msg_id,
      },
    })
  }

  // 删除文章
  articleRemove(article_id) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/content_api/v1/article/delete',
      data: {
        article_id: `${article_id}`,
      },
    })
  }

  // 创建文章
  createArticle(
    title,
    brief_content,
    mark_content,
    cover_image = '',
    category_id,
    tag_ids = ['6809640407484334093', '6809640398105870343'],
  ) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/content_api/v1/article_draft/create',
      data: {
        brief_content,
        category_id: `${category_id}`,
        cover_image,
        edit_type: 10,
        html_content: 'deprecated',
        link_url: '',
        mark_content,
        tag_ids,
        title,
      },
    })
  }

  // 更新文章
  // 文章id ,简介 , markdown content img
  updateArticle(
    id,
    title,
    brief_content,
    mark_content,
    cover_image,
    category_id,
    theme_ids,
    tag_ids,
  ) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/content_api/v1/article_draft/update',
      data: {
        brief_content,
        category_id, // 前端 分类
        cover_image,
        edit_type: 10,
        html_content: 'deprecated',
        link_url: '',
        id: `${id}`,
        mark_content,
        theme_ids, // 每天一个知识点 话题
        tag_ids, // 前端 JavaScript 面试 tag
        title,
      },
    })
  }

  // 成长任务埋点
  // 目前用于 文章阅读
  growthPointReport(item_id, task_id = 13) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/growth_api/v1/user_growth/add_point_report',
      data: {
        growth_type: 1,
        item_id: `${item_id}`,
        task_id,
      },
    })
  }

  // 获取文章评论
  getArticleComments(item_id, item_type = 2) {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/interact_api/v1/comment/list',
      data: {
        cursor: '0',
        item_type,
        sort: 0,
        limit: 20,
        item_id: `${item_id}`,
      },
    })
  }

  // 获取分类
  getCategorys() {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/tag_api/v1/query_category_list',
    })
  }

  // 获取标签
  getTags() {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/tag_api/v1/query_tag_list',
      body: { cursor: '0', key_word: '', limit: 10, sort_type: 1 },
    })
  }

  // 获取专栏
  getColumns(aid = '2608') {
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/content_api/v1/column/self_center_list',
      data: {
        aid,
      },
    })
  }

  // 获取话题
  getListHot(aid = '2608') {
    const user_id = _.sample([
      '6809637769959178254',
      '6809637767543259144',
      '6809635626879549454',
      '6809635626661445640',
      '6809637773935378440',
      '6809637771511070734',
      '6809637776263217160',
      '6809637772874219534',
    ])
    return this.request({
      method: 'POST',
      url: 'https://api.juejin.cn/tag_api/v1/theme/list_by_hot',
      body: { user_id, cursor: '0', keyword: '', limit: 10 },
    })
  }
}

module.exports = JuejinHttp

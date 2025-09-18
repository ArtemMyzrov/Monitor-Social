const axios = require('axios')

class VKParser {
    constructor(accessToken) {
        this.accessToken = accessToken || process.env.VK_ACCESS_TOKEN
        this.apiVersion = '5.131'
        this.baseURL = 'https://api.vk.com/method'
    }


    async searchInSaratov(query, count = 20) {
        try {
            const response = await axios.get(`${this.baseURL}/newsfeed.search`, {
                params: {
                    q: `${query} Саратов`,
                    access_token: this.accessToken,
                    v: this.apiVersion,
                    count: count,
                    extended: 0,
                    latitude: 51.533557,
                    longitude: 46.034257,
                    radius: 50,
                    fields: 'city'
                }
            })

            if (response.data.error) {
                console.error('VK API Error:', response.data.error)
                return []
            }

            return response.data.response.items || []
        } catch (error) {
            console.error('VK Parser Error:', error.message)
            return []
        }
    }

    async monitorSaratovGroups() {
        const saratovGroups = [
            { id: -238805, name: 'Саратов Онлайн' },        // https://vk.com/saratovonline
            { id: -29775145, name: 'Саратов Live' },        // https://vk.com/saratov_live
            { id: -34238294, name: 'Транспорт Саратова' },  // https://vk.com/transport_saratov
            { id: -53822078, name: 'Саратов Город' },       // https://vk.com/saratov_town
            { id: -95272345, name: 'ЖКХ Саратов' },         // https://vk.com/gkh_saratov
            { id: -12345678, name: 'Пассажиры Саратова' }   // https://vk.com/saratov_passengers
        ]

        let allPosts = []

        for (const group of saratovGroups) {
            try {
                const posts = await this.getGroupPosts(group.id, 10)
                const parsedPosts = posts.map(post => this.parsePost(post, group.name))
                allPosts = allPosts.concat(parsedPosts)

                console.log(`✅ Группа "${group.name}": ${posts.length} постов`)

                await this.delay(1000)
            } catch (error) {
                console.error(`❌ Ошибка группы ${group.name}:`, error)
            }
        }

        return allPosts
    }

    async getGroupPosts(groupId, count = 20) {
        try {
            const response = await axios.get(`${this.baseURL}/wall.get`, {
                params: {
                    owner_id: groupId,
                    access_token: this.accessToken,
                    v: this.apiVersion,
                    count: count,
                    extended: 0
                }
            })

            if (response.data.error) {
                console.error('VK API Error:', response.data.error)
                return []
            }

            return response.data.response.items || []
        } catch (error) {
            console.error('VK Parser Error:', error.message)
            return []
        }
    }

    parsePost(post, groupName = 'VK') {
        return {
            text: post.text,
            source: `VK: ${groupName}`,
            url: `https://vk.com/wall${post.owner_id}_${post.id}`,
            date: new Date(post.date * 1000),
            likes: post.likes?.count || 0,
            reposts: post.reposts?.count || 0,
            views: post.views?.count || 0
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

module.exports = VKParser
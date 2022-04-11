const payload = JSON.parse(MakerWebhooks.jsonEvent.JsonPayload)
const blueprint = payload && payload['package.json'] && payload['package.json'].blueprint
const group = blueprint && blueprint.group
const subgroup = blueprint && blueprint.subgroup

let postMessage = false
const postTags = ['opensource']
let tag = 'opensource'

// Ansible
if (group === 'ansible' && subgroup === 'role') {
  postTags.push('ansible')
  postTags.push('role')
  postMessage = true
  tag = 'ansible'
} else {
  Slack.postToChannel1.skip()
}

// Docker
const dockerPublish = blueprint && blueprint.dockerPublish
if (group === 'docker' || !!dockerPublish) {
  postTags.push('docker')
  postMessage = true
  tag = 'docker'
  if (subgroup === 'codeclimate') {
    postTags.push('codeclimate')
  }
} else {
  Slack.postToChannel2.skip()
}

// Go
if (group === 'go' && subgroup === 'cli') {
  postTags.push('golang')
  postTags.push('cli')
  postMessage = true
  tag = 'golang'
} else {
  Slack.postToChannel3.skip()
}

// NPM
const npmPublish = blueprint && blueprint.npmPublish
if (group === 'npm' || !!npmPublish) {
  postTags.push('node')
  postTags.push('npm')
  postTags.push('js')
  postTags.push('typescript')
  postMessage = true
  tag = 'typescript'
  if (subgroup === 'cli') {
    postTags.push('cli')
  }
} else {
  Slack.postToChannel4.skip()
}

// Packer
if (group === 'packer') {
  postTags.push('packer')
  postTags.push('vagrant')
  postTags.push('hashicorp')
  postMessage = true
  tag = 'vagrant'
} else {
  Slack.postToChannel5.skip()
}

// Python
const pythonPublish = blueprint && blueprint.pythonPublish
if (group === 'python' || !!pythonPublish) {
  postTags.push('python')
  postMessage = true
  tag = 'pythoncoding'
  if (subgroup === 'cli') {
    postTags.push('cli')
  }
} else {
  Slack.postToChannel6.skip()
}

const tags = postTags.filter((v, i, a) => a.indexOf(v) === i).map(i => '#' + i).join(' ')

const variables = payload && payload['.variables.json']
const githubOrg = variables && variables.profile && variables.profile.githubOrg
const githubRepo = blueprint && blueprint.repository && blueprint.repository.github
const gitlabRepo = blueprint && blueprint.repository && blueprint.repository.gitlab
const description = blueprint && blueprint.description
const name = blueprint && blueprint.name
const notes = payload && payload['.release.json'] && payload['.release.json'].notes.replaceAll('\n\n\n', '\n\n').replaceAll('\n\n\n\n', '\n\n').replace(/^[^\n]+\n/,'').replace(/^[\n]+\n/,'')
const releaseType = payload && payload['.release.json'] && payload['.release.json'].type
const shortUrl = githubRepo
const slug = blueprint && blueprint.slug
const version = payload && payload['package.json'] && payload['package.json'].version

// Slack
const slackMessage = 'v' + version + ' of **' + name + '** is now available. Notable changes include:\n\n' + notes
const slackTitle = 'New Major Release Available for ' + name
const slackUrl = githubRepo
const slackImage = 'https://raw.githubusercontent.com/' + githubOrg + '/' + slug + '/master/logo.png'
    
Slack.postToChannel1.setMessage(slackMessage)
Slack.postToChannel1.setTitle(slackTitle)
Slack.postToChannel1.setTitleUrl(slackUrl)
Slack.postToChannel1.setImageUrl(slackImage)
Slack.postToChannel2.setMessage(slackMessage)
Slack.postToChannel2.setTitle(slackTitle)
Slack.postToChannel2.setTitleUrl(slackUrl)
Slack.postToChannel2.setImageUrl(slackImage)
Slack.postToChannel3.setMessage(slackMessage)
Slack.postToChannel3.setTitle(slackTitle)
Slack.postToChannel3.setTitleUrl(slackUrl)
Slack.postToChannel3.setImageUrl(slackImage)
Slack.postToChannel4.setMessage(slackMessage)
Slack.postToChannel4.setTitle(slackTitle)
Slack.postToChannel4.setTitleUrl(slackUrl)
Slack.postToChannel4.setImageUrl(slackImage)
Slack.postToChannel5.setMessage(slackMessage)
Slack.postToChannel5.setTitle(slackTitle)
Slack.postToChannel5.setTitleUrl(slackUrl)
Slack.postToChannel5.setImageUrl(slackImage)
Slack.postToChannel6.setMessage(slackMessage)
Slack.postToChannel6.setTitle(slackTitle)
Slack.postToChannel6.setTitleUrl(slackUrl)
Slack.postToChannel6.setImageUrl(slackImage)

// Twitter
const tweet = 'v' + version + ' of **' + name + '** is now available. Like ' + tags + '? Link: ' + shortUrl
Twitter.postNewTweet.setTweet(tweet)

// Reddit
const redditTitles = [
  'New Version of ' + name + ' Available',
  name + ' just got an upgrade!',
  'New Major Version of ' + name + ' Available',
  'Release notes for latest major version of ' + name,
  'Cool ' + tag + ' open source project named ' + name + ' updated!',
  'Latest major update to ' + name + ' now available'
]
const redditTitle = redditTitles[Math.floor(Math.random() * redditTitles.length)]
const redditText = 'v' + version + ' of **' + name + '** is now available. ' + description + ' New features include:\n\n' + notes
const subreddit = tag
Reddit.submitTextPostReddit.setTitle(redditTitle)
Reddit.submitTextPostReddit.setText(redditText)
Reddit.submitTextPostReddit.setSubreddit(subreddit)

// LinkedIn
const linkedinMessage = 'v' + version + ' of **' + name + '** is now available. ' + description + ' Like ' + tags + '? Link: ' + shortUrl + '. Some of the updates included in the release are:\n\n' + notes
Linkedin.shareText.setMessage(linkedinMessage)

// Facebook
const facebookUrl = githubRepo
const facebookMessage = 'v' + version + ' of **' + name + '** is now available. ' + description + ' Like ' + tags + '? Linky linky: ' + shortUrl
FacebookPages.createLinkPage.setLinkUrl(facebookUrl)
FacebookPages.createLinkPage.setMessage(facebookMessage)

// Whether or not to skip all postings
const skipSocial = blueprint && blueprint.skipSocial === true
if (skipSocial || releaseType !== 'major' || !postMessage) {
  Slack.postToChannel1.skip()
  Slack.postToChannel2.skip()
  Slack.postToChannel3.skip()
  Slack.postToChannel4.skip()
  Slack.postToChannel5.skip()
  Slack.postToChannel6.skip()
  Twitter.postNewTweet.skip()
  Reddit.submitTextPostReddit.skip()
  Linkedin.shareText.skip()
  FacebookPages.createLinkPage.skip()
}

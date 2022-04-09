const payload = JSON.parse(MakerWebhooks.jsonEvent.JsonPayload)
const packageJson = payload && payload['package.json']
const blueprint = payload && payload['package.json'] && payload['package.json'].blueprint
const githubRepo = blueprint && blueprint.repository && blueprint.repository.github
const gitlabRepo = blueprint && blueprint.repository && blueprint.repository.gitlab
const group = blueprint && blueprint.group
const subgroup = blueprint && blueprint.subgroup

// Ansible
if (!(group === 'ansible' && subgroup === 'role')) {
  Slack.postToChannel1.skip()
}

// Docker
const dockerPublish = blueprint && blueprint.dockerPublish
if (!(group === 'docker' || !!dockerPublish)) {
  Slack.postToChannel2.skip()
}

// Go
if (!(group === 'go' && subgroup === 'cli')) {
  Slack.postToChannel3.skip()
}

// NPM
const npmPublish = blueprint && blueprint.npmPublish
if (!(group === 'npm' || !!npmPublish)) {
  Slack.postToChannel6.skip()
}

// Packer
if (group !== 'packer') {
  Slack.postToChannel4.skip()
}

// Python
const pythonPublish = blueprint && blueprint.pythonPublish
if (!(group === 'python' || !!pythonPublish)) {
  Slack.postToChannel5.skip()
}

const variables = payload && payload['.variables.json']
const githubOrg = variables && variables.profile && variables.profile.githubOrg
const name = blueprint && blueprint.name
const notes = payload && payload['.release.json'] && payload['.release.json'].notes.replaceAll('\n\n\n', '\n\n').replaceAll('\n\n\n\n', '\n\n').replace(/^[^\n]+\n/,'').replace(/^[\n]+\n/,'')
const releaseType = payload && payload['.release.json'] && payload['.release.json'].type
const shortUrl = gitlabRepo + '/-/jobs/' + (payload && payload['CI_JOB_ID'])
const slug = blueprint && blueprint.slug

// Slack
const slackMessage = 'The latest release of ' + name + ' cannot be published until the pipeline is fixed! Pipeline URL: ' + shortUrl + '. The notes that were generated for the build are:\n\n' + notes
const slackTitle = 'Semantic Release Failed for ' + name
const slackUrl = shortUrl
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

if (packageJson.contributors && packageJson.contributors.length) {
  Gmail.sendAnEmail.setTo(packageJson.contributors.map((x: any) => x.email).join(', '))
  Gmail.sendAnEmail.setSubject('Help! Semantic Release failure on the ' + name + ' pipeline!')
  Gmail.sendAnEmail.setBody('You are receiving this alert because you are listed as a contributor on the ' + name + ' project.\n\nThe error occurred at ' + MakerWebhooks.jsonEvent.OccurredAt + '.\n\nThe GitLab repository URL is ' + gitlabRepo + '\n\nThe GitHub mirror URL is ' + githubRepo + '\n\nThe release notes acquired from the build before it failed were:\n\n' + notes + '\n\n**The failed pipeline URL is ' + shortUrl + '**')
} else {
  Gmail.sendAnEmail.skip()
}

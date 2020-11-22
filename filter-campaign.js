/**
 * Returns only available campaigns for the current URI
 * @param { Campaign[] } campaigns - The array of campaigns
 * @param { Array<string> } allowedCampaigns - The array of id allowed
 * @return { Campaign[] }
 */
function filterCampaigns(campaigns, allowedCampaigns) {
  var allowedCampaigns = Array.isArray(allowedCampaigns) ? allowedCampaigns : []
  var campaigns = Array.isArray(campaigns) ? campaigns : []
  var isDebug = /\bdebug=true\b/.test(window.location.href)

  return campaigns.filter(function (campaign) {
    try {
      if (isDebug) {
        console.log('###campaign:', campaign[0].id, campaign[0])
      }

      if (allowedCampaigns.includes(campaign[0].id)) {
        return true
      }

      return campaign[0].rulesets[0].groups.some(function (group) {
        return group.rules.some(function (rule) {
          if (isDebug) {
            console.log(rule)
          }

          if (rule.type !== 'url-path') {
            return false
          }

          if (rule.operator === 'url-on-homepage' && window.location.pathname === '/') {
            return true
          }

          if (rule.operator === 'contains' || rule.operator === 'exact-match') {
            return window.location.pathname === rule.value
          }

          if (rule.operator === 'regex') {
            return (new RegExp(rule.value, 'gi')).test(window.location.pathname)
          }

          return false
        })
      })
    } catch (_) {
      return false
    }
  })
}

// Uso normal
document.addEventListener('om.Campaigns.init', function (event) {
  event.detail.Campaigns.campaigns = filterCampaigns(event.detail.Campaigns.campaigns);
})

// Uso normal com permissões para algumas campanhas fora das regras
var allowed = ['hmjd4b2ssmqh7xkdj6h', 'hmjd4b2ssmqefjejej6hl'] // ...

document.addEventListener('om.Campaigns.init', function (event) {
  event.detail.Campaigns.campaigns = filterCampaigns(event.detail.Campaigns.campaigns, allowed);
})

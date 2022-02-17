import {Reference} from '@sanity/types'
import type {ContentfulExport} from 'contentful-export'
import type {SysLink} from './objectIsContentfulLink'

type Options = {
  weakRefs?: boolean
}

type ReferenceOrAsset = Reference | {
  _type: 'file' | 'image'
  _sanityAsset: string
}

function prefixUrl(url: string) {
  return url.startsWith('//') ? `https:${url}` : url
}

export function contentfulLinkToSanityReference(link: SysLink, locale: string, data: ContentfulExport, options: Options = {}): ReferenceOrAsset | null {
  if (link.sys.linkType === 'Asset') {
    const asset = data.assets?.find(item => item.sys.id === link.sys.id)
    if (asset) {
      const file = asset.fields.file?.[locale]
      if (!file) {
        console.warn(`Missing file in asset [${asset.sys.id}]`)
        return null
      }

      const type = file.contentType.startsWith('image/') ? 'image' : 'file'

      if (!file.url) {
        console.warn(`Missing asset url [${asset.sys.id}]`)
        return null
      }

      return {
        _type: type,
        _sanityAsset: `${type}@${prefixUrl(file.url)}`,
      }
    }

    console.warn(`Missing asset with ID [${link.sys.id}]`)
    return null
  }

  return {
    _type: 'reference',
    _ref: link.sys.id,
    _weak: options.weakRefs,
  }
}
package com.github.namagomi.curseforge

case class CurseForgeResponse
(
  data: Data
)

case class Data
(
  id: Int,
  gameId: Int,
  name: String,
  slug: String,
  links: Links,
  summary: String,
  status: Int,
  downloadCount: Int,
  isFeatured: Boolean,
  primaryCategoryId: Int,
  categories: List[Category],
  classId: Int,
  authors: List[Author],
  logo: Logo,
  screenshots: List[Screenshot],
  mainFileId: Int,
  latestFiles: List[LatestFile],
  latestFilesIndexes: List[LatestFilesIndex],
  dateCreated: String,
  dateModified: String,
  dateReleased: String,
  allowModDistribution: Boolean,
  gamePopularityRank: Int,
  isAvailable: Boolean,
  thumbsUpCount: Int,
)

case class Links
(
  websiteUrl: String,
  wikiUrl: String,
  issuesUrl: String,
  sourceUrl: String,
)

case class Category
(
  id: Int,
  gameId: Int,
  name: String,
  slug: String,
  url: String,
  iconUrl: String,
  dateModified: String,
  isClass: Boolean,
  classId: Int,
  parentCategoryId: Int,
  displayIndex: Int,
)

case class Author
(
  id: Int,
  name: String,
  url: String,
)

case class Logo
(
  id: Int,
  modId: Int,
  title: String,
  description: String,
  thumbnailUrl: String,
  url: String
)

case class Screenshot
(
  id: Int,
  modId: Int,
  title: String,
  description: String,
  thumbnailUrl: String,
  url: String
)

case class LatestFile
(
  id: Int,
  gameId: Int,
  modId: Int,
  isAvailable: Boolean,
  displayName: String,
  fileName: String,
  releaseType: Int,
  fileStatus: Int,
  hashes: List[Hash],
  fileDate: String,
  fileLength: Int,
  downloadCount: Int,
  downloadUrl: String,
  gameVersions: List[String],
  sortableGameVersions: List[SortableGameVersion],
  dependencies: List[Dependency],
  exposeAsAlternative: Boolean,
  parentProjectFileId: Int,
  alternateFileId: Int,
  isServerPack: Boolean,
  serverPackFileId: Int,
  fileFingerprint: Int,
  modules: List[Module]
)

case class Hash
(
  value: String,
  algo: Int
)

case class SortableGameVersion
(
  gameVersionName: String,
  gameVersionPadded: String,
  gameVersion: String,
  gameVersionReleaseDate: String,
  gameVersionTypeId: Int
)

case class Dependency
(
  modId: Int,
  relationType: Int
)

case class Module
(
  name: String,
  fingerprint: Int
)

case class LatestFilesIndex
(
  gameVersion: String,
  fileId: Int,
  filename: String,
  releaseType: Int,
  gameVersionTypeId: Int,
  modLoader: Int
)
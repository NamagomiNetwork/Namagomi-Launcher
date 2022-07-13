package com.github.namagomi.main.curseforge

object ModResponse {
  case class ModResponse
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
    categories: Seq[Category],
    classId: Int,
    authors: Seq[Author],
    logo: Logo,
    screenshots: Seq[Screenshot],
    mainFileId: Int,
    latestFiles: Seq[LatestFile],
    latestFilesIndexes: Seq[LatestFilesIndex],
    dateCreated: String,
    dateModified: String,
    dateReleased: String,
    allowModDiStribution: Boolean,
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
    url: String
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
    hashes: Seq[Common.Hash],
    fileDate: String,
    fileLength: Int,
    downloadCount: Int,
    downloadUrl: String,
    gameVersions: Seq[String],
    sortableGameVersions: Seq[Common.SortableGameVersion],
    dependencies: Seq[Common.Dependency],
    exposeAsAlternative: Boolean,
    parentProjectFileId: Int,
    alternateFileId: Int,
    isServerPack: Boolean,
    serverPackFileId: Int,
    fileFingerprint: Int,
    modules: Seq[Common.Module]
  )

  case class LatestFilesIndex
  (
    gameVersion: String,
    fileId: Int,
    filename: String,
    releaseType: Int,
    gameVersionTypeId: Int,
    modLoader: Int,
  )
}

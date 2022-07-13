package com.github.namagomi.main.curseforge

object FileResponse {
  case class FileResponse
  (
    data: Data
  )

  case class Data
  (
    id: Int,
    gameId: Int,
    modId: Int,
    isAvailable: Boolean,
    displayName: String,
    fileName: String,
    releaseType: Int,
    fileStatus: Int,
    hashes: List[Common.Hash],
    fileDate: String,
    fileLength: Int,
    downloadCount: Long,
    downloadUrl: Option[String],
    gameVersions: List[String],
    sortableGameVersions: List[Common.SortableGameVersion],
    dependencies: List[Common.Dependency],
    alternateFileId: Int,
    isServerPack: Boolean,
    fileFingerprint: Long,
    modules: List[Common.Module]
  )
}
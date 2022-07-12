package com.github.namagomi.main.curseforge

object Common {
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
    fingerprint: Long
  )
}

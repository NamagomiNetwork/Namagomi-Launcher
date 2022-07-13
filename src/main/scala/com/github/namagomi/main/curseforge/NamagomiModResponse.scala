package com.github.namagomi.main.curseforge

case class NamagomiModResponse
(
  side: String,
  fileName: String,
  downloadUrl: Option[String],
  hashes: Option[List[Common.Hash]]
)
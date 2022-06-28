package com.github.namagomi.curseforge

type Side = "SERVER" | "CLIENT" | ""

class NamagomiModResponse
(
  val side: Side,
  val fileName: String,
  val downloadUrl: String,
  val curseForge: Option[CurseForge]
)

class CurseForge
(
  val id: String,
  val gameVersion: String,
  val fileId: String,
  val hashes: List[Hash]
)

class Hash
(
  val value: String,
  val algo: Int
)
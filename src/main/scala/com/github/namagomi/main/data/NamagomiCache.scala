package com.github.namagomi.main.data

case class NamagomiCache
(
  data: Seq[Data],
  mods: String
)

case class Data
(
  name: String,
  sha: String
)
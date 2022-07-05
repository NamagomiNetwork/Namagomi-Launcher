package com.github.namagomi.main.github

case class TreeData
(
  path: String,
  _type: FileType,
  sha: String,
  url: String
)
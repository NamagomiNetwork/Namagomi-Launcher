package com.github.namagomi.main.github

case class TreeData
(
  var path: String,
  var _type: FileType,
  var sha: String,
  var url: String
)
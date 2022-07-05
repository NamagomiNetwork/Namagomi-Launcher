package com.github.namagomi.main.github

case class GitTreesResponse
(
  sha: String,
  url: String,
  tree: Tree
)

case class Tree
(
  path: String,
  mode: String,
  `type`: String,
  sha: String,
  url: String,
)
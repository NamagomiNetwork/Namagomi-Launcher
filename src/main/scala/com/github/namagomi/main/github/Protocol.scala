package com.github.namagomi.main.github

import spray.json.{DefaultJsonProtocol, RootJsonFormat}

object Protocol extends DefaultJsonProtocol {
  implicit val treeProtocol: RootJsonFormat[Tree] = jsonFormat(Tree.apply, "path", "mode", "type", "sha", "url")
  implicit val gitTreesResponseProtocol: RootJsonFormat[GitTreesResponse] = jsonFormat(GitTreesResponse.apply, "sha", "url", "tree")
}

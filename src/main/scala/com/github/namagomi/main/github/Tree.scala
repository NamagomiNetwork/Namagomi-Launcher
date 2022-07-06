package com.github.namagomi.main.github

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.client.RequestBuilding.Get
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.model.{HttpEntity, Uri}
import akka.http.scaladsl.unmarshalling.Unmarshal
import com.github.namagomi.main.github.FileType.Blob
import com.github.namagomi.main.github.Protocol._
import com.github.namagomi.main.github.Tree.getFileType

import scala.+:
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContextExecutor}

class Tree(val data: TreeData, var children: Seq[Tree]) extends SprayJsonSupport {
  def this() = {
    this(TreeData("", FileType.Tree, "", ""), Seq.apply())
  }

  implicit val system: ActorSystem = ActorSystem()
  implicit val executionContext: ExecutionContextExecutor = system.dispatcher

  def build(owner: String, repo: String, sha: String): Tree = {
    this.data.sha = sha
    val apiUrl = s"https://api.github.com/repos/$owner/$repo/git/trees/$sha"
    this.fetchTree(owner, repo, apiUrl)
    this
  }

  def build(owner: String, repo: String, sha: String, path: String, _type: FileType, url: String): Tree = {
    this.data.sha = sha
    this.data.path = path
    this.data._type = _type
    this.data.url = url
    if (_type == FileType.Tree)
      this.fetchTree(owner, repo, url)
    this
  }

  def fetchTree(owner: String, repo: String, apiUrl: String): Unit = {
    val request = Get(Uri(apiUrl), HttpEntity.apply("application/json"))
    val response = Await.result(Http().singleRequest(request), Duration.Inf)
    val body = Await.result(Unmarshal(response.entity).to[GitTreesResponse], Duration.Inf)
    body.tree.foreach(item =>
      this.children = this.children +: new Tree().build(owner, repo, item.sha, item.path, getFileType(item.`type`), item.url)
    )
  }
}

object Tree {
  def getFileType(_type: String): FileType ={
    _type match {
      case "blob" => FileType.Blob
      case "tree" => FileType.Tree
    }
  }
}
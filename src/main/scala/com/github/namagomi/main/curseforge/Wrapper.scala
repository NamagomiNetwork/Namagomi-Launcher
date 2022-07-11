package com.github.namagomi.main.curseforge

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.client.RequestBuilding.Get
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.unmarshalling.Unmarshal
import akka.stream.javadsl.FileIO
import com.github.namagomi.main.Config.{curseForgeApiKey, curseForgeUrl, namagomiModListUrl}
import com.github.namagomi.main.LocalPaths._
import com.github.namagomi.main.curseforge.Protocol._
import com.github.namagomi.main.data.NamagomiCache
import com.github.namagomi.main.github.Github.getModList
import com.github.namagomi.main.{HasDownloadUrl, HasNotDownloadUrl, NamagomiModData, Unexpected}
import com.github.namagomi.main.data.NamagomiCacheProtocol._
import com.github.namagomi.main.github.GitTree
import spray.json._

import java.nio.file.Paths
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContextExecutor}
import scala.io.Source
import scala.reflect.io.File

object Wrapper extends SprayJsonSupport {
  implicit val system: ActorSystem = ActorSystem()
  implicit val executionContext: ExecutionContextExecutor = system.dispatcher

  private def getModFileUrl(namagomiMod: NamagomiModData): NamagomiModResponse = {
    namagomiMod match {
      case HasDownloadUrl(_, directUrl, side) =>
        NamagomiModResponse(
          side,
          getFileName(directUrl),
          Some(directUrl),
          None,
        )
      case HasNotDownloadUrl(_, modId, fileId, side) =>
        val getFileUrl = Uri(s"$curseForgeUrl/v1/mods/$modId/files/$fileId")

        val request = HttpRequest(GET, getFileUrl)
          .withHeaders(
            RawHeader("Accept", "application/json"),
            RawHeader("x-api-key", curseForgeApiKey)
          )

        val response = Await.result(Http().singleRequest(request), Duration.Inf)
        val body = Await.result(Unmarshal(response.entity).to[CurseForgeResponse], Duration.Inf)

        NamagomiModResponse(
          side,
          body.data.fileName,
          body.data.downloadUrl,
          Some(body.data.hashes)
        )
    }
  }

  private def getFileName(url: String): String = {
    url match {
      case "https://web.archive.org/web/20190716014402/http://forum.minecraftuser.jp/download/file.php?id=75930" =>
        "[1.12][forge2413]mod_StorageBox_v3.2.0.zip"
      case _ =>
        url.split("/").last.split("\\?").head.split('#').head
    }
  }

  private def downloadModFile(namagomiMod: NamagomiModResponse, side: String): Unit = {
    val path = Paths.get(modsDir(side), namagomiMod.fileName)
    val file = path.toFile
    namagomiMod.downloadUrl match {
      case Some(url) if !file.exists() =>
        val request = Get(Uri(url.replace(' ', '+')))
        val response = Await.result(Http().singleRequest(request), Duration.Inf)
        response.entity.dataBytes.runWith(FileIO.toPath(path))
      case None =>
        println(s"${
          namagomiMod.fileName
        } hasn't download url")
      case _ =>
    }
  }

  def downloadModFiles(side: String): Unit = {
    val modList = getModList(namagomiModListUrl("main"))

    modList.foreach {
      case Unexpected(name, modId, fileId, directUrl, side) =>
        println("Unexpected json value")
        println(s"\tname: $name")
        println(s"\tmodId: $modId")
        println(s"\tfileId: $fileId")
        println(s"\tdirectUrl: $directUrl")
        println(s"\tside: $side")
      case mod =>
        val url = getModFileUrl(mod)
        if (side.contains(url.side))
          downloadModFile(url, side)
    }
  }

  def updateModCache(side: String): Unit = {
    setupLauncherDirs(side)

    val source = Source.fromFile(namagomiCache(side))
    val cacheJson = source.getLines().mkString.parseJson.convertTo[NamagomiCache]
    source.close()

    val tree = new GitTree().build("NamagomiNetwork", "Namagomi-mod", "main")

    tree.getData("mod/mod_list.json") match {
      case Some(data) =>
        val newJson = NamagomiCache(
          cacheJson.data,
          data.data.sha
        )
          .toJson
          .compactPrint
        File(namagomiCache(side)).writeAll(newJson)
    }
  }

  def checkUpdate(side: String): Boolean = {
    setupLauncherDirs(side)

    val source = Source.fromFile(namagomiCache(side))
    val cacheJson = source.getLines().mkString.parseJson.convertTo[NamagomiCache]
    source.close()

    val tree = new GitTree().build("NamagomiNetwork", "Namagomi-mod", "main")

    tree.getData("mod/mod_list.json") match {
      case Some(data) => cacheJson.mods != data.data.sha
      case None =>
        println("[ERROR] check update failed")
        false
    }
  }

  private def setupLauncherDirs(side: String): Unit = {
    def mkdir(path: String): Unit = {
      if (!File(path).exists) {
        File(path).createDirectory()
        println(s"create: $path")
      }
    }

    def mkfile(path: String, content: String): Unit = {
      if (!File(path).exists) {
        File(path).writeAll(content)
        println(s"create: $path")
      }
    }

    mkdir(minecraftDir)
    mkdir(mainDir(side))
    mkdir(modsDir(side))
    mkfile(namagomiCache(side), NamagomiCache.getEmpty)
    mkfile(namagomiIgnore(side), "[]")
  }
}
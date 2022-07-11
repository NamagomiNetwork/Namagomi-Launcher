package com.github.namagomi.main.data

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.client.RequestBuilding.Get
import akka.http.scaladsl.unmarshalling.Unmarshal
import com.github.namagomi.main.Config
import com.github.namagomi.main.LocalPaths._
import com.github.namagomi.main.data.NamagomiCacheProtocol._
import com.github.namagomi.main.github.GitTree
import spray.json._

import java.io.PrintWriter
import java.nio.file.Paths
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContextExecutor}
import scala.io.Source
import scala.reflect.io.File

object NamagomiData {
  implicit val system: ActorSystem = ActorSystem()
  implicit val executionContext: ExecutionContextExecutor = system.dispatcher

  def downloadAllDataFiles(branch: String)(side: String): Unit = {
    val tree = new GitTree().build("NamagomiNetwork", "Namagomi-mod", branch)
    tree.getData("data") match {
      case Some(value) =>
        val dataTree = new GitTree().build("NamagomiNetwork", "Namagomi-mod", value.data.sha)
        val dataPaths = dataTree.getAllFilePaths()
        val dataSubDirs = dataTree.getAllDirPaths()

        if (!File(namagomiCache(side)).exists)
          new PrintWriter(namagomiCache(side)).write(NamagomiCache.getEmpty)

        val source = Source.fromFile(namagomiCache(side))
        val cacheJson = source.getLines().mkString.parseJson.convertTo[NamagomiCache]
        source.close()

        if (!File(mainDir(side)).exists)
          File(mainDir(side)).createDirectory()

        dataSubDirs.foreach(dir => {
          val absDir = Paths.get(mainDir(side), dir)
          if (!absDir.toFile.exists)
            File(absDir.toString).createDirectory()
        })

        val result = dataPaths.map(cfgPath => {
          def download(): Unit = {
            val filePath = Paths.get(mainDir(side), cfgPath).toString

            val response = Await.result(Http().singleRequest(Get(Config.namagomiDataFileUrlBase(branch, cfgPath))), Duration.Inf)

            response.status match {
              case 200 =>
                val fileContent = Await.result(Unmarshal(response.entity).to[String], Duration.Inf)
                val file = new PrintWriter(filePath)
                file.write(fileContent)
                file.close()
                println(s"downloaded: $cfgPath")
              case x =>
                println(s"[ERROR] $cfgPath status code $x")
            }
          }

          dataTree.getData(cfgPath) match {
            case Some(tree) =>
              cacheJson.data.find(_.name == cfgPath) match {
                case Some(data) if data.sha != tree.data.sha =>
                  download()
                  Data(cfgPath, tree.data.sha)
                case None =>
                  download()
                  Data(cfgPath, tree.data.sha)
              }
          }
        })

        val newJson = createJson(cacheJson, result)
        val cacheWriter = new PrintWriter(namagomiCache(side))
        cacheWriter.write(newJson)
        cacheWriter.close()
    }
  }

  private def createJson(before: NamagomiCache, data: Seq[Data]): String = {
    NamagomiCache(
      data,
      before.mods
    )
      .toJson
      .compactPrint
  }
}

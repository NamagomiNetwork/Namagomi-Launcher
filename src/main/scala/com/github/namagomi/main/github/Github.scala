package com.github.namagomi.main.github

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.client.RequestBuilding.Get
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.model.Uri
import akka.http.scaladsl.unmarshalling.Unmarshal
import com.github.namagomi.main.{HasDownloadUrl, HasNotDownloadUrl, NamagomiModData, Unexpected}
import com.github.namagomi.main.github.NamagomiModResponseProtocol._

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContextExecutor}

object Github extends SprayJsonSupport {
  implicit val system: ActorSystem = ActorSystem()
  implicit val executionContext: ExecutionContextExecutor = system.dispatcher

  def getModList(url: String): List[NamagomiModData] = {
    val request = Get(Uri(url))
    val response = Await.result(Http().singleRequest(request), Duration.Inf)
    val body = Await.result(Unmarshal(response.entity).to[List[NamagomiModResponse]], Duration.Inf)

    body.map(i =>
      (i.directUrl, i.modId, i.fileId) match {
        case (Some(directUrl), _, _) =>
          HasDownloadUrl(
            i.name,
            directUrl,
            i.side
          )
        case (_, Some(modId), Some(fileId)) =>
          HasNotDownloadUrl(
            i.name,
            modId,
            fileId,
            i.side
          )
        case _ =>
          Unexpected(
            i.name,
            i.modId,
            i.fileId,
            i.directUrl,
            i.side
          )
      })
  }
}

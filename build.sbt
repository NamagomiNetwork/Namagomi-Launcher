name := "Namagomi Launcher"

version := "0.1"

scalaVersion := "2.13.8"

libraryDependencies ++= Seq(
  "org.scalafx" %% "scalafx" % "16.0.0-R24",
  "org.scala-lang.modules" %% "scala-xml" % "2.1.0",
  "com.typesafe.akka" %% "akka-http" % "10.2.9",
  "com.typesafe.akka" %% "akka-stream" % "2.6.19",
  "com.typesafe.akka" %% "akka-actor" % "2.6.19",
  "com.typesafe.akka" %% "akka-http-spray-json" % "10.2.9",
  "net.harawata" % "appdirs" % "1.2.1",
  "pl.iterators" %% "kebs-spray-json" % "1.9.4",
  "pl.iterators" %% "kebs-akka-http" % "1.9.4"
)

libraryDependencies ++= {
  // Determine OS version of JavaFX binaries
  lazy val osName = System.getProperty("os.name") match {
    case n if n.startsWith("Linux") => "linux"
    case n if n.startsWith("Mac") => "mac"
    case n if n.startsWith("Windows") => "win"
    case _ => throw new Exception("Unknown platform!")
  }
  Seq("base", "controls", "fxml", "graphics", "media", "swing", "web")
    .map(m => "org.openjfx" % s"javafx-$m" % "16" classifier osName)
}
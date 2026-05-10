@ECHO OFF
SETLOCAL

SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR%"=="" SET "MAVEN_PROJECTBASEDIR=."
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

IF EXIST "%WRAPPER_JAR%" GOTO WRAPPER_FOUND

ECHO Downloading Maven wrapper jar...
POWERSHELL -NoProfile -ExecutionPolicy Bypass -Command ^
  "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%' }"
IF ERRORLEVEL 1 (
  ECHO Failed to download maven-wrapper.jar
  EXIT /B 1
)

:WRAPPER_FOUND
IF NOT "%JAVA_HOME%"=="" GOTO USE_JAVA_HOME
SET "JAVACMD=java"
GOTO RUN

:USE_JAVA_HOME
SET "JAVACMD=%JAVA_HOME%\bin\java.exe"
IF EXIST "%JAVACMD%" GOTO RUN
ECHO JAVA_HOME is set to an invalid directory: %JAVA_HOME%
EXIT /B 1

:RUN
"%JAVACMD%" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  -classpath "%WRAPPER_JAR%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*
EXIT /B %ERRORLEVEL%

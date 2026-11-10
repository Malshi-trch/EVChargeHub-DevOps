@REM ===========================================================================
@REM Maven Wrapper batch script for Windows
@REM ===========================================================================
@REM This script downloads Maven automatically if not installed.
@REM Usage: mvnw.cmd spring-boot:run
@REM ===========================================================================

@IF "%__MVNW_ARG0__%"=="" SET __MVNW_ARG0__=%~dpnx0
@SET __MVNW_PSMODULEP_SAVE=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN (`powershell -noprofile "& {$scriptDir='%~dp0'; $env:__MVNW_ARG0__='%__MVNW_ARG0__%'; & { $wrapperSha256Sum = $null; $distributionUrl = $null; $wrapperUrl = $null; $wrapperJarPath = Join-Path $scriptDir '.mvn\wrapper\maven-wrapper.jar'; $wrapperPropertiesPath = Join-Path $scriptDir '.mvn\wrapper\maven-wrapper.properties'; if (Test-Path $wrapperPropertiesPath) { $props = Get-Content $wrapperPropertiesPath; $props | ForEach-Object { if ($_ -match '^distributionUrl=(.*)') { $distributionUrl = $Matches[1].Trim() }; if ($_ -match '^wrapperUrl=(.*)') { $wrapperUrl = $Matches[1].Trim() }; if ($_ -match '^wrapperSha256Sum=(.*)') { $wrapperSha256Sum = $Matches[1].Trim() } } }; if (-not (Test-Path $wrapperJarPath)) { if (-not $wrapperUrl) { $wrapperUrl = 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar' }; Write-Host \"Downloading Maven wrapper from $wrapperUrl\"; (New-Object Net.WebClient).DownloadFile($wrapperUrl, $wrapperJarPath) }; $javaExe = 'java.exe'; if (Test-Path env:JAVA_HOME) { $javaExe = Join-Path $env:JAVA_HOME 'bin\java.exe' }; $mavenOpts = $null; if (Test-Path env:MAVEN_OPTS) { $mavenOpts = $env:MAVEN_OPTS }; Write-Output \"MVNW_CMD=$javaExe $mavenOpts -classpath \`\"$wrapperJarPath\`\" org.apache.maven.wrapper.MavenWrapperMain $distributionUrl\" } }"`) DO @IF NOT "%%A"=="" SET "%%A=%%B"
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%
@SET __MVNW_PSMODULEP_SAVE=
@SET MVNW_EXEC_DIR=%CD%

@IF NOT "%MVNW_CMD%"=="" (%MVNW_CMD% %*)


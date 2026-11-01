@REM ----------------------------------------------------------------------------
@REM ShopSphere Maven Wrapper script for Windows
@REM ----------------------------------------------------------------------------
@echo off
set MAVEN_CMD="C:\Users\srava\.m2\wrapper\dists\apache-maven-3.9.9-bin\4nf9hui3q3djbarqar9g711ggc\apache-maven-3.9.9\bin\mvn.cmd"
if exist %MAVEN_CMD% (
    %MAVEN_CMD% %*
) else (
    mvn %*
)

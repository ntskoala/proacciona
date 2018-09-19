#!/bin/bash

echo Inicio

#creamos el build

#ng build --prod
ng build

#FIRMAR APK


#IR AL DIR
cp app.yaml ./dist/app.yaml
cd ./dist/

gcloud app deploy app.yaml --project tfcbackoffice

echo FIN DEL PROCESO
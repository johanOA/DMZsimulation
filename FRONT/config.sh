#!/bin/bash

# Eliminar el gatewat predeterminado
route del default

# Agregar el gateway del firewall predeterminada
ip route add default via 10.0.10.10

#entrada a {front}
cd /FRONT/front || { echo "Directorio no existe"; exit 1; }
#Instalacion en {front}
npm i 

cd /FRONT/back || { echo "Directorio no existe"; exit 1; }
npm i
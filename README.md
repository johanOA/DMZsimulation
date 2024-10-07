
# DMZ Simulation with Docker and Shorewall Firewall

This project is a simulation of a demilitarized zone (DMZ) as you might find in a data center, using Docker containers. In addition, a Shorewall firewall has been configured to control network traffic. The purpose is to provide a foundation for anyone interested to study or implement a similar environment.



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file in /SERVICE/back

`JWT_SECRET` 

`JWT_REFRESH_SECRET`


## Installation

These networks simulate the internal and external environment of a network infrastructure, before starting, it is necessary to create the following Docker networks:

```bash
    docker network create net_external --subnet 172.168.10.0/24
    docker network create net_internal --subnet 10.0.10.0/24
```

## FIREWALL

The firewall is configured using Shorewall. To start it, use the following command:

```bash
    shorewall start
```
This will activate the configured rules that manage traffic between the internal and external networks, The front service traffic goes through port 15173:5173 and the back service traffic goes through port 4000:4000.

## SERVICE

The services container includes both backend and frontend:
- Backend located in /SERVICE/back
- Frontend located in /SERVICE/front
This container provides the application logic and user interface.

## DB

The database container is configured with the following details:
- Name of the database used by the service: userdb
- Root user password: usermy
- User: usermy
- User password usermy: usermy

Make sure you have this data at hand for the correct configuration of the database in the service.

## Some notes
Note that for each of the folders has its own Docker compose, therefore, you must run:
```bash
    docker-compose up
```
After having each container running (3) go to the SERVICE container, in which you have the 2 services, both FRONT and BACK.
To run these 2 all you have to do is run in each folder /back and /front:
```bash
    npm run dev
```
You can enter from a terminal of your computer to the SERVICE container, to execute the 2 without problem. 
## Authors

- [@JohanOA](https://github.com/johanOA)
- [@JulianINGCO](https://github.com/JulianINGCO)
- [@smarchena97](https://github.com/smarchena97)


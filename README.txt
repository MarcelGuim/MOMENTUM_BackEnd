ATENCIÓ!!!!!

per tal que funcioni bé els recordatoris, cal tenir funcionant un servidor extra. Per fer-ho seguir els pasos següents, però atenció!!!!! fer-ho en terminal linux.

Si no es té un terminal Linux, cal fer EXECUTANT EL CMD COM A ADMINISTRADOR:

    wsl --install

Després de fer això, ja es té un terminal Linux. Per entrar, des del terminal de VSC, fer: wsl i executar les següents comandes:

sudo apt update

sudo apt install redis-server

sudo systemctl start redis

sudo systemctl status redis (per veure si està running o no).

sudo systemct enable redis (per fer que automàticament en tornar a encendre el servidor,

si cau o el que sigui, aquest redis es torni a activar automàticament)

redis-cli ping (Si tot va bé, ha de respondre amb un PONG)

IMPORTANT

Si el worker (src/worker/recordatoriWorker) no està funcionant, els recordatoris no funcionaran!!

Si executem (npm install --save-dev concurrently), insta-la una dependència que permet executar diversos 

scripts alhora, és a dir, pots fer node index.js i node worker.js quan es fa npm start.

Ara mateix està configurat per tal que automàticament ja executa el index.js i el worker.js. 
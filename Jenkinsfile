pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = "cheffit"
  }

  options { timestamps() }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Deploy') {
  steps {
    sh '''
      set -euxo pipefail

      echo "== PWD =="
      pwd

      echo "== LS =="
      ls -la

      echo "== LS client/server =="
      ls -la client server || true

      echo "== docker-compose.yml =="
      cat docker-compose.yml || true

      echo "== Docker info =="
      docker version
      docker compose version

      echo "== Networks =="
      docker network ls

      echo "== DOWN =="
      docker compose -p cheffit down || true

      echo "== UP =="
      docker compose -p cheffit up -d --build
    '''
  }
}


  post {
    always {
      sh 'docker image prune -f || true'
    }
  }
}

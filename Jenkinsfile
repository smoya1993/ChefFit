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
        withCredentials([
          string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI'),
          // añade más si quieres:
          // string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')
        ]) {
          sh '''
            set -e

            # Export para que docker compose las vea
            export MONGO_URI="${MONGO_URI}"
            # export JWT_SECRET="${JWT_SECRET}"

            docker compose -p ${COMPOSE_PROJECT_NAME} down || true
            docker compose -p ${COMPOSE_PROJECT_NAME} up -d --build
            docker compose -p ${COMPOSE_PROJECT_NAME} ps
          '''
        }
      }
    }
  }

  post {
    always {
      sh 'docker image prune -f || true'
    }
  }
}

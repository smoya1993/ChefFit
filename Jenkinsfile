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
          set -e
          docker compose -p ${COMPOSE_PROJECT_NAME} down || true
          docker compose -p ${COMPOSE_PROJECT_NAME} up -d --build
          docker compose -p ${COMPOSE_PROJECT_NAME} ps
        '''
      }
    }
  }

  post {
    always {
      sh 'docker image prune -f || true'
    }
  }
}

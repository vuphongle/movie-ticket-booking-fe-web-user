pipeline {
  agent any
  
  environment {
    IMAGE_BASE = "vuphongle23/movie-ticket-booking-fe-user"
    TAG_LATEST = "${IMAGE_BASE}:latest"
    TAG_BUILD  = "${IMAGE_BASE}:${env.BUILD_NUMBER}"
    
    // VPS Configuration
    VPS_HOST = "159.223.38.127"
    VPS_USER = "root"
    DEPLOY_PATH = "/opt/movie-ticket-booking-fe-user"
  }
  
  stages {
    stage('Checkout') {
      steps {
        echo "Checking out code from GitHub..."
        checkout scm
      }
    }
    
    stage('Build Image') {
      steps {
        script {
          echo "Building Docker image: ${TAG_BUILD}"
          sh "docker build -t ${TAG_BUILD} ."
        }
      }
    }
    
    stage('Tag Latest') {
      steps {
        script {
          echo "Tagging image as latest: ${TAG_LATEST}"
          sh "docker tag ${TAG_BUILD} ${TAG_LATEST}"
        }
      }
    }
    
    stage('Push to Docker Hub') {
      steps {
        script {
          echo "Pushing images to Docker Hub..."
          withCredentials([usernamePassword(
            credentialsId: 'dockerhub',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
          )]) {
            sh """
              echo "\${DOCKER_PASS}" | docker login -u "\${DOCKER_USER}" --password-stdin
              docker push ${TAG_BUILD}
              docker push ${TAG_LATEST}
              docker logout
            """
          }
        }
      }
    }
    
    stage('Deploy to VPS') {
      steps {
        script {
          echo "Deploying to VPS: ${VPS_HOST}"
          withCredentials([sshUserPrivateKey(
            credentialsId: 'vps-ssh-key',
            keyFileVariable: 'SSH_KEY',
            usernameVariable: 'SSH_USER'
          )]) {
            sh """
              ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} ${VPS_USER}@${VPS_HOST} \
                "cd ${DEPLOY_PATH} && \
                 docker compose pull frontend-user && \
                 docker compose up -d frontend-user && \
                 docker image prune -f"
            """
          }
        }
      }
    }
  }
  
  post {
    success {
      echo '✅ Pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed!'
    }
    always {
      echo 'Cleaning up...'
      sh 'docker system prune -f || true'
    }
  }
}

pipeline {
    agent any
    
    tools {
        nodejs "node-18"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Checking out code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Client Dependencies') {
                    steps {
                        dir('client') {
                            sh 'npm install'
                            echo '✅ Client dependencies installed'
                        }
                    }
                }
                stage('Server Dependencies') {
                    steps {
                        dir('server') {
                            sh 'npm install'
                            sh 'npx prisma generate'
                            echo '✅ Server dependencies installed'
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Build Client') {
                    steps {
                        dir('client') {
                            sh 'npm run build'
                            echo '✅ Client build completed'
                        }
                    }
                }
                stage('Build Server') {
                    steps {
                        dir('server') {
                            sh 'npm run build'
                            echo '✅ Server build completed'
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                echo '🧪 Running basic tests...'
                script {
                    // Test client build
                    dir('client') {
                        sh 'test -d dist && echo "Client build verified"'
                    }
                    
                    // Test server setup
                    dir('server') {
                        sh 'test -f node_modules/.prisma/client/index.js && echo "Prisma client verified"'
                    }
                }
            }
        }
        
        stage('Deploy Preview') {
            steps {
                echo '🚀 Build ready for deployment!'
                echo 'Branch: ${env.GIT_BRANCH}'
                echo 'Commit: ${env.GIT_COMMIT}'
            }
        }
    }
    
    post {
        always {
            echo '🎉 Pipeline execution completed'
            cleanWs()
        }
        success {
            echo '✅ SUCCESS: All stages completed successfully!'
        }
        failure {
            echo '❌ FAILURE: Pipeline failed!'
        }
    }
}
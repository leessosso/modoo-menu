# My Web App

React + TypeScript + Vite로 구축된 웹 애플리케이션입니다.

## 개발 환경 설정

### 필수 요구사항
- Node.js 18 이상
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## GitHub Pages 배포

이 프로젝트는 GitHub Actions를 통해 자동으로 GitHub Pages에 배포됩니다.

### 배포 설정

1. GitHub 저장소에서 **Settings** → **Pages**로 이동
2. **Source**를 **GitHub Actions**로 설정
3. main 브랜치에 코드를 푸시하면 자동으로 배포됩니다

### 수동 배포

```bash
# 빌드
npm run build

# dist 폴더의 내용을 GitHub Pages에 업로드
```

## 기술 스택

- React 19
- TypeScript
- Vite
- ESLint

## 라이센스

MIT

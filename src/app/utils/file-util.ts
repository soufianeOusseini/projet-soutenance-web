
export class FileUtility {
  public static getImageUrl(path: string | null | undefined): string {
    const defaultImage = 'assets/images/users/default.png';

    // Récupération du companyId à partir du token JWT (champ 'aud')
    let companyId: string | null = null;
    try {
      const tokenObject = localStorage.getItem('token');
      if (tokenObject) {
        const parsed = JSON.parse(tokenObject);
        const token = parsed.accessToken;

        if (token) {
          // Décoder le token JWT manuellement
          const payload = JSON.parse(atob(token.split('.')[1]));
          companyId = payload.aud || null; // Le companyId est dans 'aud'
        }
      }
    } catch (e) {
      console.warn('Impossible de lire le token ou décoder le JWT', e);
    }

    // Cas 1: Aucun path → image par défaut
    if (!path) {
      return '';
    }

    // Cas 2: Image déjà complète (URL ou base64)
    if (path.startsWith('http') || path.startsWith('data:image')) {
      return path;
    }

    // Cas 3: Nom de fichier local + companyId connu
    if (companyId) {
      return `http://localhost:8080/api/upload/${companyId}/${path}`;
    }

    // Fallback
    return defaultImage;
  }

}

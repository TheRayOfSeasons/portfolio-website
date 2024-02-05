import { Subject } from 'rxjs';

type MusicUpload = {
  sound: string
}

export const musicUploadInitialState: MusicUpload = {
  sound: ','
};
export const musicUpload = new Subject<MusicUpload>();
musicUpload.next(musicUploadInitialState);

type Frequency = {
  average: number
  frequency: Uint8Array,
}

export const frequencyInitialState: Frequency = {
  average: 0,
  frequency: new Uint8Array(),
};

export const frequencySubject = new Subject<Frequency>();
frequencySubject.next(frequencyInitialState);

export const playToggle = new Subject<boolean>();

export const musicIsPlaying = new Subject<boolean>();

export const musicIsLoading = new Subject<boolean>();

export const invertWaves = new Subject<boolean>();

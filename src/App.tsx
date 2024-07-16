import { useEffect, useState } from 'react'
import './App.scss'
import { useVersion } from './contexts/version'
import { getAll, getChampion } from './services/champion'

import Modal from 'react-modal'
import {
  IChampionList,
  ICurrentChampion,
  ICurrentChampionSkins,
} from './interfaces'
import { purifyHtml } from './utils/purifyHtml'

Modal.setAppElement('#root')

const skillIndexToKeyboardCode: { [key: number]: string } = {
  0: 'Q',
  1: 'W',
  2: 'E',
  3: 'R',
}

const initialCurrentChampion: ICurrentChampion = {
  name: '',
  id: '',
  key: '',
  title: '',
  skins: [],
  allytips: [],
  enemytips: [],
  tags: [],
  partype: '',
  info: {
    attack: 0,
    defense: 0,
    magic: 0,
    difficulty: 0,
  },
  passive: {
    name: '',
    description: '',
    image: {
      full: '',
      sprite: '',
    }
  },
  spells: [],
  image: {
    full: '',
  },
}

function App() {
  const [champions, setChampions] = useState<IChampionList[]>([])
  const [isChampionModalOpen, setIsChampionModalOpen] = useState(false)
  const [currentChampion, setCurrentChampion] = useState<ICurrentChampion>(initialCurrentChampion)

  const { version } = useVersion()

  useEffect(() => {
    localStorage.clear()
  }, [])

  useEffect(() => {
    if (version) {
      getAll({ version, locale: 'pt_BR' }).then((data) => {
        const formattedChampions = Object.keys(data).map((key) => data[key])
        setChampions(formattedChampions)
      })
    }
  }, [version])

  function handleOpenChampionModal(championName: string) {
    getChampion({ version, locale: 'pt_BR', championName }).then((data) => {
      Object.keys(data).map((key) => {
        setCurrentChampion(data[key])
      })
    })
    setIsChampionModalOpen(true)
  }

  function handleCloseChampionModal() {
    setIsChampionModalOpen(false)
  }

  return (
    <>
      <section className="champions-container">
        {champions.map((champion) => (
          <div
            key={champion.key}
            className="champion-card"
            onClick={() => handleOpenChampionModal(champion.id)}
          >
            <div className="image-container">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`}
                loading="lazy"
                alt={`${champion.name} profile image`}
              />
            </div>
            <div className="champion-name">
              <h2>{champion.name}</h2>
            </div>
          </div>
        ))}
      </section>
      <Modal
        isOpen={isChampionModalOpen}
        onRequestClose={handleCloseChampionModal}
        overlayClassName="react-modal-overlay"
        className="react-modal-content"
      >
        {Object.keys(currentChampion).length > 0 && (
          <section id="modal-section">
            <div className="modal-header">
              <div className="champion-profile-image">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${currentChampion.image.full}`}
                  loading="lazy"
                />
              </div>
              <div>
                <h3>{currentChampion.name}</h3>
                <p><strong>Classe: </strong>{currentChampion.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
                </p>
              </div>
              <div className="modal-info">
                <p><strong>Atack: </strong>{currentChampion.info.attack}</p>
                <p><strong>Defense: </strong>{currentChampion.info.defense}</p>
                <p><strong>Difficulty: </strong>{currentChampion.info.difficulty}</p>
                <p><strong>Magic: </strong>{currentChampion.info.magic}</p>
              </div>
            </div>
            <div className="modal-body">
              {Object.keys(currentChampion).length > 0 && (
                <>
                  <h3>Spells</h3>
                  <div className='modal-spells'>
                    <div className='card-spell'>
                      <div><p><strong>{currentChampion.passive.name}</strong></p></div>
                      <div>
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${currentChampion.passive.image.full}`}
                          loading="lazy"
                        />
                      </div>
                      <p>{purifyHtml(currentChampion.passive.description)}</p>
                      <div>
                        <video
                          src={`https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${currentChampion.key.padStart(
                            4,
                            '0',
                          )}/ability_${currentChampion.key.padStart(
                            4,
                            '0',
                          )}_P1.mp4`}
                          controls
                          preload="metadata"
                          muted={true}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    {currentChampion.spells.map((spell, index) => (
                      <div key={spell.name} className='card-spell'>
                        <div><p><strong>{spell.name}</strong></p></div>
                        <div>
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`}
                            loading="lazy"
                          />
                        </div>
                        <p>{purifyHtml(spell.description)}</p>
                        <div>
                          <video
                            src={`https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${currentChampion.key.padStart(
                              4,
                              '0',
                            )}/ability_${currentChampion.key.padStart(
                              4,
                              '0',
                            )}_${skillIndexToKeyboardCode[index]}1.mp4`}
                            controls
                            preload="metadata"
                            muted={true}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <section>
                    <h3>Skins</h3>
                    <div className='skins-container'>
                      {currentChampion.skins.map(
                        (skin: ICurrentChampionSkins) => (
                          <div key={skin.id} className='skin-content'>
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${currentChampion.id}_${skin.num}.jpg`}
                              loading="lazy"
                              className="image-splash-art"
                            />
                            <p>{skin.name === 'default'
                              ? currentChampion.name
                              : skin.name}</p>
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </section>
        )}
      </Modal>
    </>
  )
}

export default App

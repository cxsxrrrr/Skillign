import { Link } from "react-router-dom";
import SkillCover from "./SkillCover";

export default function SkillCard({ skill, grid = false, heading = "h3" }) {
  const Heading = heading;

  return (
    <Link
      className={`nb-card${grid ? " nb-card--grid" : ""}`}
      to={`/skills/${skill.slug}`}
    >
      <SkillCover skill={skill} />
      <Heading className="nb-card__title">{skill.name}</Heading>
      <p className="nb-card__desc">{skill.tagline}</p>
    </Link>
  );
}

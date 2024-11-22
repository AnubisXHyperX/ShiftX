import Spinner from './spinner'
import { Card } from './ui/card'

const PageLoader = () => {
  return (
    <div className="flex justify-center">
      <Card className="p-3">
        <Spinner />
      </Card>
    </div>
  )
}

export default PageLoader
